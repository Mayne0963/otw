import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface FareEstimateRequest {
  pickupLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  destination: {
    lat: number;
    lng: number;
    address: string;
  };
  vehicleType: string;
}

interface FareEstimateResponse {
  success: boolean;
  data?: {
    estimatedFare: {
      min: number;
      max: number;
    };
    distance: {
      value: number; // in meters
      text: string; // formatted string like "5.2 km"
    };
    duration: {
      value: number; // in seconds
      text: string; // formatted string like "12 mins"
    };
    eta: string; // estimated time of arrival
    vehicleInfo: {
      name: string;
      basePrice: number;
      pricePerMile: number;
    };
  };
  error?: string;
}

// Vehicle pricing data
const vehicleTypes = {
  '1': { name: 'EcoRide', basePrice: 5.00, pricePerMile: 1.20 },
  '2': { name: 'ComfortPlus', basePrice: 8.00, pricePerMile: 1.80 },
  '3': { name: 'LuxuryXL', basePrice: 15.00, pricePerMile: 3.50 },
  '4': { name: 'GroupRide', basePrice: 12.00, pricePerMile: 2.20 },
};

// Calculate distance using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// Estimate travel time based on distance (simplified)
function estimateTravelTime(distanceKm: number): number {
  // Assume average speed of 30 km/h in city traffic
  const averageSpeedKmh = 30;
  return (distanceKm / averageSpeedKmh) * 60; // Return time in minutes
}

// Format distance for display
function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

// Format duration for display
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} mins`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = Math.round(minutes % 60);
  return `${hours}h ${remainingMins}m`;
}

// Calculate ETA
function calculateETA(travelTimeMinutes: number): string {
  const now = new Date();
  const eta = new Date(now.getTime() + (travelTimeMinutes + 5) * 60000); // Add 5 mins for pickup
  return eta.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

export async function POST(req: NextRequest): Promise<NextResponse<FareEstimateResponse>> {
  try {
    const body: FareEstimateRequest = await req.json();

    // Validate required fields
    if (!body.pickupLocation || !body.destination || !body.vehicleType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: pickupLocation, destination, and vehicleType are required' },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (!body.pickupLocation.lat || !body.pickupLocation.lng || 
        !body.destination.lat || !body.destination.lng) {
      return NextResponse.json(
        { success: false, error: 'Invalid coordinates provided' },
        { status: 400 }
      );
    }

    // Get vehicle info
    const vehicleInfo = vehicleTypes[body.vehicleType as keyof typeof vehicleTypes];
    if (!vehicleInfo) {
      return NextResponse.json(
        { success: false, error: 'Invalid vehicle type' },
        { status: 400 }
      );
    }

    // Calculate distance
    const distanceKm = calculateDistance(
      body.pickupLocation.lat,
      body.pickupLocation.lng,
      body.destination.lat,
      body.destination.lng
    );

    const distanceMeters = distanceKm * 1000;
    const distanceMiles = distanceKm * 0.621371;

    // Calculate travel time
    const travelTimeMinutes = estimateTravelTime(distanceKm);

    // Calculate fare
    const baseFare = vehicleInfo.basePrice;
    const distanceFare = distanceMiles * vehicleInfo.pricePerMile;
    const totalFare = baseFare + distanceFare;

    // Add some variance for min/max estimate (±15%)
    const minFare = totalFare * 0.85;
    const maxFare = totalFare * 1.15;

    // Simulate network delay (remove in production)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const response: FareEstimateResponse = {
      success: true,
      data: {
        estimatedFare: {
          min: Math.round(minFare * 100) / 100,
          max: Math.round(maxFare * 100) / 100
        },
        distance: {
          value: Math.round(distanceMeters),
          text: formatDistance(distanceKm)
        },
        duration: {
          value: Math.round(travelTimeMinutes * 60), // convert to seconds
          text: formatDuration(travelTimeMinutes)
        },
        eta: calculateETA(travelTimeMinutes),
        vehicleInfo: {
          name: vehicleInfo.name,
          basePrice: vehicleInfo.basePrice,
          pricePerMile: vehicleInfo.pricePerMile
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error calculating fare estimate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate fare estimate. Please try again.' },
      { status: 500 }
    );
  }
}