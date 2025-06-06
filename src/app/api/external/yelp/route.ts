import { NextRequest, NextResponse } from 'next/server';
import { YelpService } from '@/lib/services/external-apis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'search') {
      const params = {
        term: searchParams.get('term') || undefined,
        location: searchParams.get('location') || undefined,
        latitude: searchParams.get('latitude') ? parseFloat(searchParams.get('latitude')!) : undefined,
        longitude: searchParams.get('longitude') ? parseFloat(searchParams.get('longitude')!) : undefined,
        radius: searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : undefined,
        categories: searchParams.get('categories') || undefined,
        locale: searchParams.get('locale') || undefined,
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
        offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
        sort_by: searchParams.get('sort_by') as 'best_match' | 'rating' | 'review_count' | 'distance' || undefined,
        price: searchParams.get('price') as '1' | '2' | '3' | '4' || undefined,
        open_now: searchParams.get('open_now') === 'true',
        open_at: searchParams.get('open_at') ? parseInt(searchParams.get('open_at')!) : undefined,
        attributes: searchParams.get('attributes') || undefined,
      };

      const result = await YelpService.searchBusinesses(params);
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'details') {
      const businessId = searchParams.get('businessId');
      if (!businessId) {
        return NextResponse.json(
          { success: false, error: 'Business ID is required' },
          { status: 400 },
        );
      }

      const business = await YelpService.getBusinessDetails(businessId);
      return NextResponse.json({ success: true, data: business });
    }

    if (action === 'reviews') {
      const businessId = searchParams.get('businessId');
      if (!businessId) {
        return NextResponse.json(
          { success: false, error: 'Business ID is required' },
          { status: 400 },
        );
      }

      const locale = searchParams.get('locale') || undefined;
      const reviews = await YelpService.getBusinessReviews(businessId, locale);
      return NextResponse.json({ success: true, data: reviews });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use "search", "details", or "reviews"' },
      { status: 400 },
    );
  } catch (error) {
    console.error('Yelp API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}