import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-config';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    // Get restaurant info from Firestore
    const restaurantRef = doc(db, 'restaurants', 'broskis');
    const restaurantSnap = await getDoc(restaurantRef);

    if (restaurantSnap.exists()) {
      const restaurantData = restaurantSnap.data();
      return NextResponse.json(restaurantData);
    } else {
      // Return default data if not found in Firestore
      const defaultRestaurantInfo = {
        name: "Broski's Grill",
        rating: 4.8,
        reviewCount: 1247,
        priceRange: "$$",
        description: "Experience the ultimate fusion of bold flavors and fresh ingredients at Broski's Grill. Our signature dishes combine traditional techniques with modern innovation.",
        features: ["Fresh Ingredients", "Bold Flavors", "Quick Service", "Dine-in & Takeout"],
        hours: "Mon-Sun: 11:00 AM - 10:00 PM",
        phone: "(555) 123-4567",
        address: "123 Main Street, Downtown",
        contact: {
          phone: "(555) 123-4567",
          address: "123 Main Street, Downtown, City 12345",
          website: "www.broskisgrill.com"
        },
        cuisine: "Modern American cuisine with bold flavors and fresh ingredients. Our chefs create innovative dishes that blend traditional techniques with contemporary tastes."
      };

      return NextResponse.json(defaultRestaurantInfo);
    }
  } catch (error) {
    console.error('Error fetching restaurant info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurant information' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Here you could add logic to update restaurant info
    // For now, we'll just return success
    return NextResponse.json({ success: true, message: 'Restaurant info updated' });
  } catch (error) {
    console.error('Error updating restaurant info:', error);
    return NextResponse.json(
      { error: 'Failed to update restaurant information' },
      { status: 500 }
    );
  }
}