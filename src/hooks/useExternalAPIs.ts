import { useState, useCallback } from 'react';
import {
  DocumenuRestaurant,
  ZomatoRestaurant,
  YelpBusiness,
  KrogerProduct,
  BestBuyProduct,
} from '@/lib/services/external-apis';

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface UnifiedRestaurantResults {
  documenu: DocumenuRestaurant[];
  zomato: ZomatoRestaurant[];
  yelp: YelpBusiness[];
  errors: string[];
}

interface UnifiedProductResults {
  kroger: KrogerProduct[];
  bestbuy: BestBuyProduct[];
  errors: string[];
}

export function useExternalAPIs() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeAPICall = useCallback(async <T>(url: string): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url);
      const result: APIResponse<T> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'API call failed');
      }

      return result.data || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('API call error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Documenu API calls
  const searchDocumenuRestaurants = useCallback(async (params: {
    lat?: number;
    lon?: number;
    distance?: number;
    size?: number;
    page?: number;
    fullmenu?: boolean;
    key_phrase?: string;
    exact_match?: boolean;
  }) => {
    const searchParams = new URLSearchParams({
      action: 'search',
      ...Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      ),
    });

    return makeAPICall<DocumenuRestaurant[]>(`/api/external/documenu?${searchParams}`);
  }, [makeAPICall]);

  const getDocumenuMenu = useCallback(async (restaurantId: string) => {
    const searchParams = new URLSearchParams({
      action: 'menu',
      restaurantId,
    });

    return makeAPICall<DocumenuRestaurant>(`/api/external/documenu?${searchParams}`);
  }, [makeAPICall]);

  // Zomato API calls
  const searchZomatoRestaurants = useCallback(async (params: {
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
  }) => {
    const searchParams = new URLSearchParams({
      action: 'search',
      ...Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      ),
    });

    return makeAPICall<ZomatoRestaurant[]>(`/api/external/zomato?${searchParams}`);
  }, [makeAPICall]);

  const getZomatoRestaurantDetails = useCallback(async (restaurantId: string) => {
    const searchParams = new URLSearchParams({
      action: 'details',
      restaurantId,
    });

    return makeAPICall<ZomatoRestaurant>(`/api/external/zomato?${searchParams}`);
  }, [makeAPICall]);

  // Yelp API calls
  const searchYelpBusinesses = useCallback(async (params: {
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
  }) => {
    const searchParams = new URLSearchParams({
      action: 'search',
      ...Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      ),
    });

    return makeAPICall<{ businesses: YelpBusiness[]; total: number; region: any }>(
      `/api/external/yelp?${searchParams}`,
    );
  }, [makeAPICall]);

  const getYelpBusinessDetails = useCallback(async (businessId: string) => {
    const searchParams = new URLSearchParams({
      action: 'details',
      businessId,
    });

    return makeAPICall<YelpBusiness>(`/api/external/yelp?${searchParams}`);
  }, [makeAPICall]);

  const getYelpBusinessReviews = useCallback(async (businessId: string, locale?: string) => {
    const searchParams = new URLSearchParams({
      action: 'reviews',
      businessId,
      ...(locale && { locale }),
    });

    return makeAPICall<{
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
    }>(`/api/external/yelp?${searchParams}`);
  }, [makeAPICall]);

  // Kroger API calls
  const searchKrogerProducts = useCallback(async (params: {
    q?: string;
    locationId?: string;
    productId?: string;
    brand?: string;
    fulfillment?: 'ais' | 'csp' | 'dug' | 'sto';
    start?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams({
      action: 'products',
      ...Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      ),
    });

    return makeAPICall<{ data: KrogerProduct[]; meta: any }>(`/api/external/kroger?${searchParams}`);
  }, [makeAPICall]);

  const getKrogerLocations = useCallback(async (params: {
    zipCode?: string;
    radius?: number;
    limit?: number;
    chain?: string;
    department?: string;
  }) => {
    const searchParams = new URLSearchParams({
      action: 'locations',
      ...Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      ),
    });

    return makeAPICall<{ data: any[]; meta: any }>(`/api/external/kroger?${searchParams}`);
  }, [makeAPICall]);

  // Best Buy API calls
  const searchBestBuyProducts = useCallback(async (params: {
    q?: string;
    categoryId?: string;
    format?: 'json' | 'xml';
    show?: string;
    sort?: string;
    facet?: string;
    cursorMark?: string;
    pageSize?: number;
    page?: number;
  }) => {
    const searchParams = new URLSearchParams({
      action: 'products',
      ...Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      ),
    });

    return makeAPICall<{ products: BestBuyProduct[]; total: number; totalPages: number }>(
      `/api/external/bestbuy?${searchParams}`,
    );
  }, [makeAPICall]);

  const getBestBuyProductDetails = useCallback(async (sku: number) => {
    const searchParams = new URLSearchParams({
      action: 'product',
      sku: String(sku),
    });

    return makeAPICall<BestBuyProduct>(`/api/external/bestbuy?${searchParams}`);
  }, [makeAPICall]);

  const getBestBuyStores = useCallback(async (params: {
    area?: string;
    storeId?: number;
    storeType?: string;
    format?: 'json' | 'xml';
    show?: string;
    sort?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const searchParams = new URLSearchParams({
      action: 'stores',
      ...Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      ),
    });

    return makeAPICall<{ stores: any[]; total: number; totalPages: number }>(
      `/api/external/bestbuy?${searchParams}`,
    );
  }, [makeAPICall]);

  const checkBestBuyProductAvailability = useCallback(async (sku: number, storeId: number) => {
    const searchParams = new URLSearchParams({
      action: 'availability',
      sku: String(sku),
      storeId: String(storeId),
    });

    return makeAPICall<{
      sku: number;
      storeId: number;
      inStoreAvailability: boolean;
      inStoreAvailabilityText: string;
      inStoreAvailabilityUpdateDate: string;
    }>(`/api/external/bestbuy?${searchParams}`);
  }, [makeAPICall]);

  // Unified search calls
  const searchRestaurants = useCallback(async (params: {
    latitude?: number;
    longitude?: number;
    location?: string;
    term?: string;
    radius?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams({
      type: 'restaurants',
      ...Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      ),
    });

    return makeAPICall<UnifiedRestaurantResults>(`/api/external/unified-search?${searchParams}`);
  }, [makeAPICall]);

  const searchProducts = useCallback(async (params: {
    query: string;
    location?: string;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams({
      type: 'products',
      ...Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      ),
    });

    return makeAPICall<UnifiedProductResults>(`/api/external/unified-search?${searchParams}`);
  }, [makeAPICall]);

  return {
    loading,
    error,
    // Documenu
    searchDocumenuRestaurants,
    getDocumenuMenu,
    // Zomato
    searchZomatoRestaurants,
    getZomatoRestaurantDetails,
    // Yelp
    searchYelpBusinesses,
    getYelpBusinessDetails,
    getYelpBusinessReviews,
    // Kroger
    searchKrogerProducts,
    getKrogerLocations,
    // Best Buy
    searchBestBuyProducts,
    getBestBuyProductDetails,
    getBestBuyStores,
    checkBestBuyProductAvailability,
    // Unified
    searchRestaurants,
    searchProducts,
  };
}