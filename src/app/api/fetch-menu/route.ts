import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, doc, getDocs, getDoc, query, where, orderBy, limit } from "firebase/firestore";

export const dynamic = "force-dynamic";

interface MenuFilter {
  restaurantId?: string;
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  dietary?: string[];
  available?: boolean;
  search?: string;
}

interface ExternalMenuRequest {
  source: 'documenu' | 'yelp' | 'zomato';
  restaurantId: string;
  location?: string;
}

// GET - Fetch menu items
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const dietary = searchParams.get('dietary')?.split(',');
    const available = searchParams.get('available');
    const source = searchParams.get('source') as 'local' | 'external';
    const external = searchParams.get('external') as 'documenu' | 'yelp' | 'zomato';
    
    // Handle external menu fetching
    if (source === 'external' && external && restaurantId) {
      return await fetchExternalMenu(external, restaurantId);
    }
    
    // Fetch from local database
    const menuQuery = collection(db, 'menu_items');
    const constraints = [];
    
    if (restaurantId) {
      constraints.push(where('restaurantId', '==', restaurantId));
    }
    
    if (category) {
      constraints.push(where('category', '==', category));
    }
    
    if (available !== null) {
      constraints.push(where('available', '==', available === 'true'));
    }
    
    if (dietary && dietary.length > 0) {
      constraints.push(where('dietary', 'array-contains-any', dietary));
    }
    
    constraints.push(orderBy('name'));
    constraints.push(limit(100));
    
    const q = query(menuQuery, ...constraints);
    const querySnapshot = await getDocs(q);
    
    let menuItems: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      menuItems.push({
        id: doc.id,
        ...data
      });
    });
    
    // Apply additional filters
    if (search) {
      const searchLower = search.toLowerCase();
      menuItems = menuItems.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.ingredients?.some((ing: string) => ing.toLowerCase().includes(searchLower))
      );
    }
    
    if (minPrice || maxPrice) {
      menuItems = menuItems.filter(item => {
        const price = item.price;
        if (minPrice && price < parseFloat(minPrice)) return false;
        if (maxPrice && price > parseFloat(maxPrice)) return false;
        return true;
      });
    }
    
    // Group by category if no specific category requested
    let result;
    if (!category) {
      const grouped = menuItems.reduce((acc, item) => {
        const cat = item.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      }, {});
      
      result = {
        success: true,
        data: grouped,
        totalItems: menuItems.length,
        categories: Object.keys(grouped)
      };
    } else {
      result = {
        success: true,
        data: menuItems,
        totalItems: menuItems.length,
        category
      };
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Menu fetch error:', error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

// POST - Fetch external menu and optionally cache it
export async function POST(req: NextRequest) {
  try {
    const request: ExternalMenuRequest = await req.json();
    
    if (!request.source || !request.restaurantId) {
      return NextResponse.json(
        { error: "Source and restaurant ID are required" },
        { status: 400 }
      );
    }
    
    const menuData = await fetchExternalMenu(request.source, request.restaurantId, request.location);
    
    return menuData;
    
  } catch (error) {
    console.error('External menu fetch error:', error);
    return NextResponse.json(
      { error: "Failed to fetch external menu" },
      { status: 500 }
    );
  }
}

// Helper function to fetch from external APIs
async function fetchExternalMenu(source: string, restaurantId: string, location?: string) {
  try {
    let apiUrl = '';
    const headers: Record<string, string> = {};
    
    switch (source) {
      case 'documenu':
        const documenuKey = process.env.DOCUMENU_API_KEY;
        if (!documenuKey) {
          return NextResponse.json(
            { error: "Documenu API key not configured" },
            { status: 503 }
          );
        }
        apiUrl = `https://api.documenu.com/v2/restaurant/${restaurantId}/menuitems`;
        headers['X-API-KEY'] = documenuKey;
        break;
        
      case 'yelp':
        const yelpKey = process.env.YELP_API_KEY;
        if (!yelpKey) {
          return NextResponse.json(
            { error: "Yelp API key not configured" },
            { status: 503 }
          );
        }
        // Yelp doesn't have direct menu API, so we'll return business details
        apiUrl = `https://api.yelp.com/v3/businesses/${restaurantId}`;
        headers['Authorization'] = `Bearer ${yelpKey}`;
        break;
        
      case 'zomato':
        const zomatoKey = process.env.ZOMATO_API_KEY;
        if (!zomatoKey) {
          return NextResponse.json(
            { error: "Zomato API key not configured" },
            { status: 503 }
          );
        }
        apiUrl = `https://developers.zomato.com/api/v2.1/restaurant?res_id=${restaurantId}`;
        headers['user-key'] = zomatoKey;
        break;
        
      default:
        return NextResponse.json(
          { error: "Unsupported menu source" },
          { status: 400 }
        );
    }
    
    const response = await fetch(apiUrl, {
      headers,
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform data based on source
    let transformedData;
    switch (source) {
      case 'documenu':
        transformedData = {
          success: true,
          source: 'documenu',
          data: data.data?.map((item: any) => ({
            id: item.menu_item_id,
            name: item.menu_item_name,
            description: item.menu_item_description,
            price: item.menu_item_pricing?.[0]?.price || 0,
            category: item.menu_item_category,
            image: item.menu_item_image,
            available: true,
            external: true
          })) || [],
          totalItems: data.data?.length || 0
        };
        break;
        
      case 'yelp':
        // Yelp business details - no direct menu
        transformedData = {
          success: true,
          source: 'yelp',
          data: {
            restaurant: {
              id: data.id,
              name: data.name,
              categories: data.categories,
              price: data.price,
              rating: data.rating,
              phone: data.phone,
              location: data.location,
              photos: data.photos
            }
          },
          message: "Yelp doesn't provide direct menu access. Restaurant details provided."
        };
        break;
        
      case 'zomato':
        transformedData = {
          success: true,
          source: 'zomato',
          data: {
            restaurant: {
              id: data.id,
              name: data.name,
              cuisines: data.cuisines,
              average_cost_for_two: data.average_cost_for_two,
              currency: data.currency,
              rating: data.user_rating,
              location: data.location,
              photos_url: data.photos_url,
              menu_url: data.menu_url
            }
          },
          message: "Menu details available at menu_url"
        };
        break;
        
      default:
        transformedData = { success: false, error: "Unknown source" };
    }
    
    return NextResponse.json(transformedData);
    
  } catch (error) {
    console.error(`External ${source} API error:`, error);
    return NextResponse.json(
      { 
        error: `Failed to fetch from ${source}`,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update menu cache or sync external data
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    
    if (action === 'sync') {
      // Sync external menu data to local database
      const { restaurantId, source } = await req.json();
      
      if (!restaurantId || !source) {
        return NextResponse.json(
          { error: "Restaurant ID and source are required for sync" },
          { status: 400 }
        );
      }
      
      // This would implement syncing logic
      return NextResponse.json({
        success: true,
        message: "Menu sync functionality would be implemented here",
        restaurantId,
        source
      });
    }
    
    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Menu update error:', error);
    return NextResponse.json(
      { error: "Failed to update menu" },
      { status: 500 }
    );
  }
}

// DELETE - Clear menu cache
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');
    const category = searchParams.get('category');
    
    if (!restaurantId) {
      return NextResponse.json(
        { error: "Restaurant ID is required" },
        { status: 400 }
      );
    }
    
    // This would implement cache clearing logic
    return NextResponse.json({
      success: true,
      message: "Menu cache clearing functionality would be implemented here",
      restaurantId,
      category
    });
    
  } catch (error) {
    console.error('Menu cache clear error:', error);
    return NextResponse.json(
      { error: "Failed to clear menu cache" },
      { status: 500 }
    );
  }
}
