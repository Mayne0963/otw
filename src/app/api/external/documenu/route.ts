import { NextRequest, NextResponse } from 'next/server';
import { DocumenuService } from '@/lib/services/external-apis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'search') {
      const params = {
        lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined,
        lon: searchParams.get('lon') ? parseFloat(searchParams.get('lon')!) : undefined,
        distance: searchParams.get('distance') ? parseInt(searchParams.get('distance')!) : undefined,
        size: searchParams.get('size') ? parseInt(searchParams.get('size')!) : undefined,
        page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
        fullmenu: searchParams.get('fullmenu') === 'true',
        key_phrase: searchParams.get('key_phrase') || undefined,
        exact_match: searchParams.get('exact_match') === 'true',
      };

      const restaurants = await DocumenuService.searchRestaurants(params);
      return NextResponse.json({ success: true, data: restaurants });
    }

    if (action === 'menu') {
      const restaurantId = searchParams.get('restaurantId');
      if (!restaurantId) {
        return NextResponse.json(
          { success: false, error: 'Restaurant ID is required' },
          { status: 400 },
        );
      }

      const restaurant = await DocumenuService.getRestaurantMenu(restaurantId);
      return NextResponse.json({ success: true, data: restaurant });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use "search" or "menu"' },
      { status: 400 },
    );
  } catch (error) {
    console.error('Documenu API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}