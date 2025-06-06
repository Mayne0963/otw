import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface DistanceRequest {
  origin: string;
  destination: string;
}

// POST - Calculate distance between two locations
export async function POST(req: NextRequest) {
  try {
    const body: DistanceRequest = await req.json();

    // Validate required fields
    if (!body.origin || !body.destination) {
      return NextResponse.json(
        { success: false, error: 'Origin and destination are required' },
        { status: 400 },
      );
    }

    // For now, we'll use a simple calculation or mock data
    // In a real implementation, you would use Google Maps Distance Matrix API
    // or another mapping service

    // Mock distance calculation based on string similarity/length
    // This is a placeholder - replace with actual distance calculation
    const mockDistance = calculateMockDistance(body.origin, body.destination);

    return NextResponse.json({
      success: true,
      distance: mockDistance,
      origin: body.origin,
      destination: body.destination,
    });

  } catch (error) {
    console.error('Error calculating distance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate distance' },
      { status: 500 },
    );
  }
}

// Mock distance calculation function
// Replace this with actual Google Maps API or other mapping service
function calculateMockDistance(origin: string, destination: string): number {
  // Simple mock calculation based on string differences
  // In reality, you'd use coordinates and proper distance calculation

  const baseDistance = 2; // Base distance in miles
  const variableDistance = Math.abs(origin.length - destination.length) * 0.5;
  const randomFactor = Math.random() * 3; // Add some randomness

  const totalDistance = baseDistance + variableDistance + randomFactor;

  // Round to 1 decimal place and ensure minimum distance
  return Math.max(1, Math.round(totalDistance * 10) / 10);
}

// GET - Get distance calculation (alternative endpoint)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');

  if (!origin || !destination) {
    return NextResponse.json(
      { success: false, error: 'Origin and destination parameters are required' },
      { status: 400 },
    );
  }

  try {
    const mockDistance = calculateMockDistance(origin, destination);

    return NextResponse.json({
      success: true,
      distance: mockDistance,
      origin,
      destination,
    });

  } catch (error) {
    console.error('Error calculating distance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate distance' },
      { status: 500 },
    );
  }
}