import { NextRequest, NextResponse } from 'next/server';
import { KrogerService } from '@/lib/services/external-apis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'products') {
      const params: any = {};
      const q = searchParams.get('q');
      const locationId = searchParams.get('locationId');
      const productId = searchParams.get('productId');
      const brand = searchParams.get('brand');
      const fulfillment = searchParams.get('fulfillment') as 'ais' | 'csp' | 'dug' | 'sto';
      const start = searchParams.get('start');
      const limit = searchParams.get('limit');
      
      if (q) params.q = q;
      if (locationId) params.locationId = locationId;
      if (productId) params.productId = productId;
      if (brand) params.brand = brand;
      if (fulfillment) params.fulfillment = fulfillment;
      if (start) params.start = parseInt(start);
      if (limit) params.limit = parseInt(limit);

      const result = await KrogerService.searchProducts(params);
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'locations') {
      const params: any = {};
      const zipCode = searchParams.get('zipCode');
      const radius = searchParams.get('radius');
      const limit = searchParams.get('limit');
      const chain = searchParams.get('chain');
      const department = searchParams.get('department');
      
      if (zipCode) params['filter.zipCode.near'] = zipCode;
      if (radius) params['filter.radiusInMiles'] = parseInt(radius);
      if (limit) params['filter.limit'] = parseInt(limit);
      if (chain) params['filter.chain'] = chain;
      if (department) params['filter.department'] = department;

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