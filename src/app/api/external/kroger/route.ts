import { NextRequest, NextResponse } from 'next/server';
import { KrogerService } from '@/lib/services/external-apis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'products') {
      const params = {
        q: searchParams.get('q') || undefined,
        locationId: searchParams.get('locationId') || undefined,
        productId: searchParams.get('productId') || undefined,
        brand: searchParams.get('brand') || undefined,
        fulfillment: searchParams.get('fulfillment') as 'ais' | 'csp' | 'dug' | 'sto' || undefined,
        start: searchParams.get('start') ? parseInt(searchParams.get('start')!) : undefined,
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      };

      const result = await KrogerService.searchProducts(params);
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'locations') {
      const params = {
        'filter.zipCode.near': searchParams.get('zipCode') || undefined,
        'filter.radiusInMiles': searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : undefined,
        'filter.limit': searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
        'filter.chain': searchParams.get('chain') || undefined,
        'filter.department': searchParams.get('department') || undefined,
      };

      const result = await KrogerService.getLocations(params);
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use "products" or "locations"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Kroger API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}