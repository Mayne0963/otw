import { env } from '../env';

// Types for external API responses
export interface DocumenuRestaurant {
  restaurant_id: string;
  restaurant_name: string;
  restaurant_phone?: string;
  restaurant_website?: string;
  hours?: string;
  price_range?: string;
  price_range_100?: number;
  restaurant_logo?: string;
  menus?: DocumenuMenu[];
}

export interface DocumenuMenu {
  menu_name: string;
  menu_sections: DocumenuSection[];
}

export interface DocumenuSection {
  section_name: string;
  menu_items: DocumenuMenuItem[];
}

export interface DocumenuMenuItem {
  menu_item_name: string;
  menu_item_description?: string;
  menu_item_price?: string;
  menu_item_pricing?: Array<{
    price: string;
    currency: string;
    priceString: string;
  }>;
}

export interface ZomatoRestaurant {
  id: string;
  name: string;
  url: string;
  location: {
    address: string;
    locality: string;
    city: string;
    latitude: string;
    longitude: string;
  };
  cuisines: string;
  average_cost_for_two: number;
  price_range: number;
  currency: string;
  thumb: string;
  featured_image: string;
  photos_url: string;
  menu_url: string;
  events_url: string;
  user_rating: {
    aggregate_rating: string;
    rating_text: string;
    rating_color: string;
    votes: string;
  };
}

export interface YelpBusiness {
  id: string;
  alias: string;
  name: string;
  image_url: string;
  is_closed: boolean;
  url: string;
  review_count: number;
  categories: Array<{
    alias: string;
    title: string;
  }>;
  rating: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  transactions: string[];
  price?: string;
  location: {
    address1: string;
    address2?: string;
    address3?: string;
    city: string;
    zip_code: string;
    country: string;
    state: string;
    display_address: string[];
  };
  phone: string;
  display_phone: string;
  distance?: number;
}

export interface KrogerProduct {
  productId: string;
  upc: string;
  aisleLocations: Array<{
    bayNumber: string;
    description: string;
    number: string;
    numberOfFacings: string;
    sequenceNumber: string;
    side: string;
    shelfNumber: string;
    shelfPositionInBay: string;
  }>;
  brand: string;
  categories: string[];
  countryOrigin: string;
  description: string;
  items: Array<{
    itemId: string;
    favorite: boolean;
    fulfillment: {
      curbside: boolean;
      delivery: boolean;
      inStore: boolean;
      shipToHome: boolean;
    };
    price: {
      regular: number;
      promo: number;
    };
    size: string;
    soldBy: string;
  }>;
  productType: string;
  publishedDate: string;
  romanceDescription: string;
  tags: string[];
  temperature: {
    indicator: string;
    heatSensitive: boolean;
  };
}

export interface BestBuyProduct {
  sku: number;
  customerReviewCount: number;
  customerReviewAverage: number;
  inStoreAvailability: boolean;
  inStoreAvailabilityText: string;
  inStoreAvailabilityUpdateDate: string;
  itemUpdateDate: string;
  lineOfBusiness: string;
  onlineAvailability: boolean;
  onlineAvailabilityText: string;
  onlineAvailabilityUpdateDate: string;
  releaseDate: string;
  name: string;
  type: string;
  startDate: string;
  new: boolean;
  active: boolean;
  lowPriceGuarantee: boolean;
  activeUpdateDate: string;
  regularPrice: number;
  salePrice: number;
  clearance: boolean;
  onSale: boolean;
  planPrice: number;
  priceWithPlan: number;
  priceRestriction: string;
  priceUpdateDate: string;
  digital: boolean;
  preowned: boolean;
  carriers: Array<{
    name: string;
  }>;
  planFeatures: any[];
  devices: any[];
  carrierPlans: any[];
  technologyCode: string;
  carrierModelNumber: string;
  earlyTerminationFees: any[];
  outletCenter: boolean;
  secondaryMarket: boolean;
  frequentlyPurchasedWith: any[];
  accessories: any[];
  relatedProducts: any[];
  requiredParts: any[];
  energyGuide: string;
  longDescription: string;
  includedItemList: any[];
  instantSavings: boolean;
  currentOffer: any[];
  quantityLimit: number;
  color: string;
  depth: string;
  height: string;
  weight: string;
  width: string;
  warrantyLabor: string;
  warrantyParts: string;
  softwareAge: string;
  softwareGrade: string;
  platform: string;
  numberOfPlayers: string;
  genre: string;
  esrbRating: string;
  longDescriptionHtml: string;
  features: Array<{
    feature: string;
  }>;
  categoryPath: Array<{
    id: string;
    name: string;
  }>;
  alternateCategories: Array<{
    id: string;
    name: string;
  }>;
  lists: any[];
  customerTopRated: boolean;
  url: string;
  spin360Url: string;
  mobileUrl: string;
  affiliateUrl: string;
  addToCartUrl: string;
  affiliateAddToCartUrl: string;
  linkShareAffiliateUrl: string;
  linkShareAffiliateAddToCartUrl: string;
  upc: string;
  productTemplate: string;
  categoryId: string;
  categoryName: string;
  subclass: string;
  subclassId: string;
  class: string;
  classId: string;
  department: string;
  departmentId: string;
  protectionPlanTerm: string;
  protectionPlanType: string;
  protectionPlanLowPrice: string;
  protectionPlanHighPrice: string;
  buybackPlans: any[];
  protectionPlans: any[];
  protectionPlanDetails: string;
  productFamilies: any[];
  productVariations: any[];
  aspectRatio: string;
  screenFormat: string;
  lengthInMinutes: number;
  mpaaRating: string;
  plot: string;
  studio: string;
  theatricalReleaseDate: string;
  description: string;
  manufacturer: string;
  modelNumber: string;
  images: Array<{
    rel: string;
    unitOfMeasure: string;
    width: string;
    height: string;
    href: string;
    primary: boolean;
  }>;
  image: string;
  largeFrontImage: string;
  mediumImage: string;
  thumbnailImage: string;
  largeImage: string;
  alternateViewsImage: string;
  angleImage: string;
  backViewImage: string;
  energyGuideImage: string;
  leftViewImage: string;
  accessoriesImage: string;
  remoteControlImage: string;
  rightViewImage: string;
  topViewImage: string;
  albumTitle: string;
  artistName: string;
  artistId: number;
  originalReleaseDate: string;
  parentalAdvisory: boolean;
  mediaCount: number;
  monoStereo: string;
  studioLive: string;
  copyrightYear: number;
  audioTracks: any[];
  originalLanguage: string;
  subtitleLanguage: string;
  dubLanguage: string;
  dtsDigitalSurround: boolean;
  dolbyDigital: boolean;
  dolbyDigitalEx: boolean;
  dolbyProLogic: boolean;
  dolbyProLogicII: boolean;
  dolbyDigitalSurroundEX: boolean;
}

// Kroger OAuth token management
let krogerAccessToken: string | null = null;
let krogerTokenExpiry: number = 0;

async function getKrogerAccessToken(): Promise<string> {
  if (krogerAccessToken && Date.now() < krogerTokenExpiry) {
    return krogerAccessToken;
  }

  const response = await fetch('https://api.kroger.com/v1/connect/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${env.KROGER_CLIENT_ID}:${env.KROGER_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials&scope=product.compact',
  });

  if (!response.ok) {
    throw new Error(`Kroger OAuth failed: ${response.statusText}`);
  }

  const data = await response.json();
  krogerAccessToken = data.access_token;
  krogerTokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 minute early

  return krogerAccessToken;
}

// Documenu API Service
export class DocumenuService {
  private static readonly BASE_URL = 'https://api.documenu.com/v2';

  static async searchRestaurants(params: {
    lat?: number;
    lon?: number;
    distance?: number;
    size?: number;
    page?: number;
    fullmenu?: boolean;
    key_phrase?: string;
    exact_match?: boolean;
  }): Promise<DocumenuRestaurant[]> {
    if (!env.DOCUMENU_API_KEY) {
      throw new Error('Documenu API key not configured');
    }

    const searchParams = new URLSearchParams({
      key: env.DOCUMENU_API_KEY,
      ...Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ),
    });

    const response = await fetch(`${this.BASE_URL}/restaurants/search/geo?${searchParams}`);
    
    if (!response.ok) {
      throw new Error(`Documenu API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  static async getRestaurantMenu(restaurantId: string): Promise<DocumenuRestaurant> {
    if (!env.DOCUMENU_API_KEY) {
      throw new Error('Documenu API key not configured');
    }

    const response = await fetch(
      `${this.BASE_URL}/restaurant/${restaurantId}?key=${env.DOCUMENU_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Documenu API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }
}

// Zomato API Service (via RapidAPI)
export class ZomatoService {
  private static readonly BASE_URL = 'https://zomato.p.rapidapi.com';

  static async searchRestaurants(params: {
    entity_id?: number;
    entity_type?: string;
    q?: string;
    start?: number;
    count?: number;
    lat?: number;
    lon?: number;
    radius?: number;
    cuisines?: string;
    establishment_type?: string;
    collection_id?: number;
    category?: string;
    sort?: string;
    order?: string;
  }): Promise<ZomatoRestaurant[]> {
    if (!env.ZOMATO_API_KEY) {
      throw new Error('Zomato API key not configured');
    }

    const searchParams = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      )
    );

    const response = await fetch(`${this.BASE_URL}/search?${searchParams}`, {
      headers: {
        'X-RapidAPI-Key': env.ZOMATO_API_KEY,
        'X-RapidAPI-Host': 'zomato.p.rapidapi.com',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Zomato API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.restaurants?.map((r: any) => r.restaurant) || [];
  }

  static async getRestaurantDetails(restaurantId: string): Promise<ZomatoRestaurant> {
    if (!env.ZOMATO_API_KEY) {
      throw new Error('Zomato API key not configured');
    }

    const response = await fetch(`${this.BASE_URL}/restaurant?res_id=${restaurantId}`, {
      headers: {
        'X-RapidAPI-Key': env.ZOMATO_API_KEY,
        'X-RapidAPI-Host': 'zomato.p.rapidapi.com',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Zomato API error: ${response.statusText}`);
    }

    return await response.json();
  }
}

// Yelp Fusion API Service
export class YelpService {
  private static readonly BASE_URL = 'https://api.yelp.com/v3';

  static async searchBusinesses(params: {
    term?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    categories?: string;
    locale?: string;
    limit?: number;
    offset?: number;
    sort_by?: 'best_match' | 'rating' | 'review_count' | 'distance';
    price?: '1' | '2' | '3' | '4';
    open_now?: boolean;
    open_at?: number;
    attributes?: string;
  }): Promise<{ businesses: YelpBusiness[]; total: number; region: any }> {
    if (!env.YELP_API_KEY) {
      throw new Error('Yelp API key not configured');
    }

    const searchParams = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      )
    );

    const response = await fetch(`${this.BASE_URL}/businesses/search?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${env.YELP_API_KEY}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Yelp API error: ${response.statusText}`);
    }

    return await response.json();
  }

  static async getBusinessDetails(businessId: string): Promise<YelpBusiness> {
    if (!env.YELP_API_KEY) {
      throw new Error('Yelp API key not configured');
    }

    const response = await fetch(`${this.BASE_URL}/businesses/${businessId}`, {
      headers: {
        'Authorization': `Bearer ${env.YELP_API_KEY}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Yelp API error: ${response.statusText}`);
    }

    return await response.json();
  }

  static async getBusinessReviews(businessId: string, locale?: string): Promise<{
    reviews: Array<{
      id: string;
      url: string;
      text: string;
      rating: number;
      time_created: string;
      user: {
        id: string;
        profile_url: string;
        image_url: string;
        name: string;
      };
    }>;
    total: number;
    possible_languages: string[];
  }> {
    if (!env.YELP_API_KEY) {
      throw new Error('Yelp API key not configured');
    }

    const searchParams = new URLSearchParams();
    if (locale) searchParams.append('locale', locale);

    const response = await fetch(
      `${this.BASE_URL}/businesses/${businessId}/reviews?${searchParams}`,
      {
        headers: {
          'Authorization': `Bearer ${env.YELP_API_KEY}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Yelp API error: ${response.statusText}`);
    }

    return await response.json();
  }
}

// Kroger API Service
export class KrogerService {
  private static readonly BASE_URL = 'https://api.kroger.com/v1';

  static async searchProducts(params: {
    q?: string;
    locationId?: string;
    productId?: string;
    brand?: string;
    fulfillment?: 'ais' | 'csp' | 'dug' | 'sto';
    start?: number;
    limit?: number;
  }): Promise<{ data: KrogerProduct[]; meta: any }> {
    const token = await getKrogerAccessToken();
    
    const searchParams = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      )
    );

    const response = await fetch(`${this.BASE_URL}/products?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Kroger API error: ${response.statusText}`);
    }

    return await response.json();
  }

  static async getLocations(params: {
    'filter.zipCode.near'?: string;
    'filter.radiusInMiles'?: number;
    'filter.limit'?: number;
    'filter.chain'?: string;
    'filter.department'?: string;
  }): Promise<{ data: any[]; meta: any }> {
    const token = await getKrogerAccessToken();
    
    const searchParams = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      )
    );

    const response = await fetch(`${this.BASE_URL}/locations?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Kroger API error: ${response.statusText}`);
    }

    return await response.json();
  }
}

// Best Buy API Service
export class BestBuyService {
  private static readonly BASE_URL = 'https://api.bestbuy.com/v1';

  static async searchProducts(params: {
    q?: string;
    categoryId?: string;
    format?: 'json' | 'xml';
    show?: string;
    sort?: string;
    facet?: string;
    cursorMark?: string;
    pageSize?: number;
    page?: number;
  }): Promise<{ products: BestBuyProduct[]; total: number; totalPages: number }> {
    if (!env.BESTBUY_API_KEY) {
      throw new Error('Best Buy API key not configured');
    }

    const searchParams = new URLSearchParams({
      apiKey: env.BESTBUY_API_KEY,
      format: 'json',
      ...Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ),
    });

    const response = await fetch(`${this.BASE_URL}/products?${searchParams}`);
    
    if (!response.ok) {
      throw new Error(`Best Buy API error: ${response.statusText}`);
    }

    return await response.json();
  }

  static async getProductDetails(sku: number): Promise<BestBuyProduct> {
    if (!env.BESTBUY_API_KEY) {
      throw new Error('Best Buy API key not configured');
    }

    const response = await fetch(
      `${this.BASE_URL}/products/${sku}.json?apiKey=${env.BESTBUY_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Best Buy API error: ${response.statusText}`);
    }

    return await response.json();
  }

  static async getStores(params: {
    area?: string;
    storeId?: number;
    storeType?: string;
    format?: 'json' | 'xml';
    show?: string;
    sort?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ stores: any[]; total: number; totalPages: number }> {
    if (!env.BESTBUY_API_KEY) {
      throw new Error('Best Buy API key not configured');
    }

    const searchParams = new URLSearchParams({
      apiKey: env.BESTBUY_API_KEY,
      format: 'json',
      ...Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ),
    });

    const response = await fetch(`${this.BASE_URL}/stores?${searchParams}`);
    
    if (!response.ok) {
      throw new Error(`Best Buy API error: ${response.statusText}`);
    }

    return await response.json();
  }

  static async checkProductAvailability(sku: number, storeId: number): Promise<{
    sku: number;
    storeId: number;
    inStoreAvailability: boolean;
    inStoreAvailabilityText: string;
    inStoreAvailabilityUpdateDate: string;
  }> {
    if (!env.BESTBUY_API_KEY) {
      throw new Error('Best Buy API key not configured');
    }

    const response = await fetch(
      `${this.BASE_URL}/products/${sku}/stores/${storeId}.json?apiKey=${env.BESTBUY_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Best Buy API error: ${response.statusText}`);
    }

    return await response.json();
  }
}

// Unified search service that aggregates results from multiple APIs
export class UnifiedSearchService {
  static async searchRestaurants(params: {
    latitude?: number;
    longitude?: number;
    location?: string;
    term?: string;
    radius?: number;
    limit?: number;
  }) {
    const results = {
      documenu: [] as DocumenuRestaurant[],
      zomato: [] as ZomatoRestaurant[],
      yelp: [] as YelpBusiness[],
      errors: [] as string[],
    };

    // Search Documenu
    try {
      if (params.latitude && params.longitude) {
        results.documenu = await DocumenuService.searchRestaurants({
          lat: params.latitude,
          lon: params.longitude,
          distance: params.radius || 5000,
          size: params.limit || 20,
          fullmenu: true,
          key_phrase: params.term,
        });
      }
    } catch (error) {
      results.errors.push(`Documenu: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Search Zomato
    try {
      if (params.latitude && params.longitude) {
        results.zomato = await ZomatoService.searchRestaurants({
          lat: params.latitude,
          lon: params.longitude,
          radius: params.radius || 5000,
          q: params.term,
          count: params.limit || 20,
        });
      }
    } catch (error) {
      results.errors.push(`Zomato: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Search Yelp
    try {
      const yelpParams: any = {
        term: params.term,
        limit: params.limit || 20,
      };
      
      if (params.latitude && params.longitude) {
        yelpParams.latitude = params.latitude;
        yelpParams.longitude = params.longitude;
        yelpParams.radius = Math.min(params.radius || 5000, 40000); // Yelp max radius
      } else if (params.location) {
        yelpParams.location = params.location;
      }

      const yelpResponse = await YelpService.searchBusinesses(yelpParams);
      results.yelp = yelpResponse.businesses;
    } catch (error) {
      results.errors.push(`Yelp: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return results;
  }

  static async searchProducts(params: {
    query: string;
    location?: string;
    limit?: number;
  }) {
    const results = {
      kroger: [] as KrogerProduct[],
      bestbuy: [] as BestBuyProduct[],
      errors: [] as string[],
    };

    // Search Kroger
    try {
      const krogerResponse = await KrogerService.searchProducts({
        q: params.query,
        limit: params.limit || 20,
      });
      results.kroger = krogerResponse.data;
    } catch (error) {
      results.errors.push(`Kroger: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Search Best Buy
    try {
      const bestbuyResponse = await BestBuyService.searchProducts({
        q: params.query,
        pageSize: params.limit || 20,
      });
      results.bestbuy = bestbuyResponse.products;
    } catch (error) {
      results.errors.push(`Best Buy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return results;
  }
}