import { NextRequest, NextResponse } from 'next/server';
import { geocodeAddress, reverseGeocode } from '@/lib/maps';
import { geocodingService, type BatchGeocodingRequest } from '@/lib/services/geocoding-service';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('Google Maps API key not found in environment variables');
}



export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const address = searchParams.get('address');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const query = searchParams.get('query');
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const language = searchParams.get('language');
  const region = searchParams.get('region');
  const strict = searchParams.get('strict') === 'true';

  if (!GOOGLE_MAPS_API_KEY) {
    return NextResponse.json(
      { error: 'Google Maps API key not configured' },
      { status: 500 }
    );
  }

  try {
    switch (action) {
      case 'geocode':
        if (!address) {
          return NextResponse.json(
            { error: 'Address parameter is required' },
            { status: 400 }
          );
        }
        const geocodeResult = await geocodingService.geocode(address, {
          language: language || undefined,
          region: region || undefined,
        });
        return NextResponse.json(geocodeResult);

      case 'reverse':
        if (!lat || !lng) {
          return NextResponse.json(
            { error: 'Latitude and longitude parameters are required' },
            { status: 400 }
          );
        }
        const reverseResult = await geocodingService.reverseGeocode(
          parseFloat(lat),
          parseFloat(lng),
          {
            language: language || undefined,
          }
        );
        return NextResponse.json(reverseResult);

      case 'validate':
        if (!address) {
          return NextResponse.json(
            { error: 'Address parameter is required' },
            { status: 400 }
          );
        }
        const validationResult = await geocodingService.validateAddress(address, {
          strictValidation: strict,
          checkDeliverability: true,
          allowPOBoxes: false,
          allowApproximateMatches: !strict,
          requiredComponents: strict ? ['street_number', 'route', 'locality'] : undefined,
        });
        return NextResponse.json(validationResult);

      case 'health':
        const healthStatus = await geocodingService.healthCheck();
        return NextResponse.json(healthStatus);

      case 'stats':
        const stats = geocodingService.getStats();
        return NextResponse.json(stats);

      case 'places':
        if (!query) {
          return NextResponse.json(
            { error: 'Query parameter is required' },
            { status: 400 }
          );
        }
        
        const placesResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
            query
          )}&key=${GOOGLE_MAPS_API_KEY}${language ? `&language=${language}` : ''}`
        );
        const placesData = await placesResponse.json();
        return NextResponse.json(placesData);

      case 'directions':
        if (!origin || !destination) {
          return NextResponse.json(
            { error: 'Origin and destination parameters are required' },
            { status: 400 }
          );
        }
        
        const directionsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
            origin
          )}&destination=${encodeURIComponent(
            destination
          )}&key=${GOOGLE_MAPS_API_KEY}${language ? `&language=${language}` : ''}`
        );
        const directionsData = await directionsResponse.json();
        return NextResponse.json(directionsData);

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Supported actions: geocode, reverse, validate, health, stats, places, directions' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Maps API error:', error);
    
    // Handle rate limiting errors
    if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!GOOGLE_MAPS_API_KEY) {
    return NextResponse.json(
      { error: 'Google Maps API key not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'geocode':
        const { address, options = {} } = body;
        if (!address) {
          return NextResponse.json(
            { error: 'Address is required' },
            { status: 400 }
          );
        }
        const result = await geocodingService.geocode(address, options);
        return NextResponse.json(result);

      case 'batch-geocode':
        const batchRequest: BatchGeocodingRequest = body;
        if (!batchRequest.addresses || !Array.isArray(batchRequest.addresses)) {
          return NextResponse.json(
            { error: 'Addresses array is required' },
            { status: 400 }
          );
        }
        if (batchRequest.addresses.length > 100) {
          return NextResponse.json(
            { error: 'Maximum 100 addresses allowed per batch request' },
            { status: 400 }
          );
        }
        const batchResult = await geocodingService.batchGeocode(batchRequest);
        return NextResponse.json(batchResult);

      case 'validate':
        const { address: validateAddress, validationOptions = {} } = body;
        if (!validateAddress) {
          return NextResponse.json(
            { error: 'Address is required' },
            { status: 400 }
          );
        }
        const validationResult = await geocodingService.validateAddress(
          validateAddress,
          validationOptions
        );
        return NextResponse.json(validationResult);

      case 'reverse-geocode':
        const { lat, lng, options: reverseOptions = {} } = body;
        if (lat === undefined || lng === undefined) {
          return NextResponse.json(
            { error: 'Latitude and longitude are required' },
            { status: 400 }
          );
        }
        const reverseResult = await geocodingService.reverseGeocode(
          parseFloat(lat),
          parseFloat(lng),
          reverseOptions
        );
        return NextResponse.json(reverseResult);

      case 'clear-cache':
        geocodingService.clearCache();
        return NextResponse.json({ success: true, message: 'Cache cleared' });

      case 'places':
        const { query, location, radius, language } = body;
        if (!query) {
          return NextResponse.json(
            { error: 'Query is required' },
            { status: 400 }
          );
        }
        
        let placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
          query
        )}&key=${GOOGLE_MAPS_API_KEY}`;
        
        if (location && location.lat && location.lng) {
          placesUrl += `&location=${location.lat},${location.lng}`;
        }
        
        if (radius) {
          placesUrl += `&radius=${radius}`;
        }
        
        if (language) {
          placesUrl += `&language=${language}`;
        }
        
        const placesResponse = await fetch(placesUrl);
        const placesData = await placesResponse.json();
        return NextResponse.json(placesData);

      case 'directions':
        const { origin, destination, mode = 'driving', directionsLanguage } = body;
        if (!origin || !destination) {
          return NextResponse.json(
            { error: 'Origin and destination are required' },
            { status: 400 }
          );
        }
        
        let directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
          origin
        )}&destination=${encodeURIComponent(
          destination
        )}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`;
        
        if (directionsLanguage) {
          directionsUrl += `&language=${directionsLanguage}`;
        }
        
        const directionsResponse = await fetch(directionsUrl);
        const directionsData = await directionsResponse.json();
        return NextResponse.json(directionsData);

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: geocode, batch-geocode, validate, reverse-geocode, clear-cache, places, directions' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Maps API POST error:', error);
    
    // Handle rate limiting errors
    if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
