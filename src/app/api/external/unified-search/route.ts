import { NextRequest, NextResponse } from 'next/server';
import { UnifiedSearchService } from '@/lib/services/external-apis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'restaurants') {
      const params: {
        latitude?: number;
        longitude?: number;
        location?: string;
        term?: string;
        radius?: number;
        limit?: number;
      } = {};
      
      const latParam = searchParams.get('latitude');
      if (latParam) params.latitude = parseFloat(latParam);
      
      const lngParam = searchParams.get('longitude');
      if (lngParam) params.longitude = parseFloat(lngParam);
      
      const locationParam = searchParams.get('location');
      if (locationParam) params.location = locationParam;
      
      const termParam = searchParams.get('term');
      if (termParam) params.term = termParam;
      
      const radiusParam = searchParams.get('radius');
      if (radiusParam) params.radius = parseInt(radiusParam);
      
      const limitParam = searchParams.get('limit');
      if (limitParam) params.limit = parseInt(limitParam);

      const results = await UnifiedSearchService.searchRestaurants(params);
      return NextResponse.json({ success: true, data: results });
    }

    if (type === 'products') {
      const query = searchParams.get('query');
      if (!query) {
        return NextResponse.json(
          { success: false, error: 'Query parameter is required for product search' },
          { status: 400 }
        );
      }

      const params: any = { query };
      const location = searchParams.get('location');
      const limit = searchParams.get('limit');
      
      if (location) params.location = location;
      if (limit) params.limit = parseInt(limit);

      const results = await UnifiedSearchService.searchProducts(params);
      return NextResponse.json({ success: true, data: results });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type. Use "restaurants" or "products"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Unified search API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}