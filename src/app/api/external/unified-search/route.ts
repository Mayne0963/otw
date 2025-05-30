import { NextRequest, NextResponse } from 'next/server';
import { UnifiedSearchService } from '@/lib/services/external-apis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'restaurants') {
      const params = {
        latitude: searchParams.get('latitude') ? parseFloat(searchParams.get('latitude')!) : undefined,
        longitude: searchParams.get('longitude') ? parseFloat(searchParams.get('longitude')!) : undefined,
        location: searchParams.get('location') || undefined,
        term: searchParams.get('term') || undefined,
        radius: searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : undefined,
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      };

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

      const params = {
        query,
        location: searchParams.get('location') || undefined,
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      };

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