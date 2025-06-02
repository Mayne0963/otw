import { NextRequest, NextResponse } from "next/server";

interface GeocodeRequest {
  address: string;
}

interface PlacesSearchRequest {
  query: string;
  location?: { lat: number; lng: number };
  radius?: number;
  type?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  // Check if API key is configured
  const hasApiKey = !!process.env.GOOGLE_MAPS_API_KEY;
  
  if (!hasApiKey) {
    return NextResponse.json({
      hasApiKey: false,
      error: "Google Maps API key not configured"
    }, { status: 503 });
  }

  if (!action) {
    return NextResponse.json({ hasApiKey });
  }

  try {
    switch (action) {
      case 'geocode':
        return await handleGeocode(searchParams);
      case 'places':
        return await handlePlacesSearch(searchParams);
      case 'directions':
        return await handleDirections(searchParams);
      default:
        return NextResponse.json({ hasApiKey });
    }
  } catch (error) {
    console.error('Maps API error:', error);
    return NextResponse.json(
      { error: "Maps service error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const hasApiKey = !!process.env.GOOGLE_MAPS_API_KEY;
  
  if (!hasApiKey) {
    return NextResponse.json({
      error: "Google Maps API key not configured"
    }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'geocode':
        return await handleGeocodePost(body);
      case 'places':
        return await handlePlacesSearchPost(body);
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Maps API error:', error);
    return NextResponse.json(
      { error: "Maps service error" },
      { status: 500 }
    );
  }
}

async function handleGeocode(searchParams: URLSearchParams) {
  const address = searchParams.get('address');
  
  if (!address) {
    return NextResponse.json(
      { error: "Address parameter required" },
      { status: 400 }
    );
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );

  const data = await response.json();
  return NextResponse.json(data);
}

async function handleGeocodePost(body: GeocodeRequest) {
  const { address } = body;
  
  if (!address) {
    return NextResponse.json(
      { error: "Address required" },
      { status: 400 }
    );
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );

  const data = await response.json();
  return NextResponse.json(data);
}

async function handlePlacesSearch(searchParams: URLSearchParams) {
  const query = searchParams.get('query');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') || '5000';
  const type = searchParams.get('type');
  
  if (!query) {
    return NextResponse.json(
      { error: "Query parameter required" },
      { status: 400 }
    );
  }

  let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  
  if (lat && lng) {
    url += `&location=${lat},${lng}&radius=${radius}`;
  }
  
  if (type) {
    url += `&type=${type}`;
  }

  const response = await fetch(url);
  const data = await response.json();
  return NextResponse.json(data);
}

async function handlePlacesSearchPost(body: PlacesSearchRequest) {
  const { query, location, radius = 5000, type } = body;
  
  if (!query) {
    return NextResponse.json(
      { error: "Query required" },
      { status: 400 }
    );
  }

  let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  
  if (location) {
    url += `&location=${location.lat},${location.lng}&radius=${radius}`;
  }
  
  if (type) {
    url += `&type=${type}`;
  }

  const response = await fetch(url);
  const data = await response.json();
  return NextResponse.json(data);
}

async function handleDirections(searchParams: URLSearchParams) {
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const mode = searchParams.get('mode') || 'driving';
  
  if (!origin || !destination) {
    return NextResponse.json(
      { error: "Origin and destination parameters required" },
      { status: 400 }
    );
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );

  const data = await response.json();
  return NextResponse.json(data);
}
