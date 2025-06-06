import { NextRequest, NextResponse } from 'next/server';
import { ZomatoService } from '@/lib/services/external-apis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'search') {
      const params = {
        entity_id: searchParams.get('entity_id') ? parseInt(searchParams.get('entity_id')!) : undefined,
        entity_type: searchParams.get('entity_type') || undefined,
        q: searchParams.get('q') || undefined,
        start: searchParams.get('start') ? parseInt(searchParams.get('start')!) : undefined,
        count: searchParams.get('count') ? parseInt(searchParams.get('count')!) : undefined,
        lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined,
        lon: searchParams.get('lon') ? parseFloat(searchParams.get('lon')!) : undefined,
        radius: searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : undefined,
        cuisines: searchParams.get('cuisines') || undefined,
        establishment_type: searchParams.get('establishment_type') || undefined,
        collection_id: searchParams.get('collection_id') ? parseInt(searchParams.get('collection_id')!) : undefined,
        category: searchParams.get('category') || undefined,
        sort: searchParams.get('sort') || undefined,
        order: searchParams.get('order') || undefined,
      };

      const restaurants = await ZomatoService.searchRestaurants(params);
      return NextResponse.json({ success: true, data: restaurants });
    }

    if (action === 'details') {
      const restaurantId = searchParams.get('restaurantId');
      if (!restaurantId) {
        return NextResponse.json(
          { success: false, error: 'Restaurant ID is required' },
          { status: 400 },
        );
      }

      const restaurant = await ZomatoService.getRestaurantDetails(restaurantId);
      return NextResponse.json({ success: true, data: restaurant });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use "search" or "details"' },
      { status: 400 },
    );
  } catch (error) {
    console.error('Zomato API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}