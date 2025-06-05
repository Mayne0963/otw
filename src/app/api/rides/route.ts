import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, getDocs, addDoc, query, where, orderBy } from "firebase/firestore";

export const dynamic = "force-dynamic";

interface VehicleType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  pricePerMile: number;
  capacity: number;
  features: string[];
  estimatedArrival: string;
  available: boolean;
}

interface RideRequest {
  pickupLocation: string;
  destination: string;
  vehicleType: string;
  scheduledTime?: string;
  passengers: number;
  specialRequests?: string;
}

// GET - Retrieve available vehicle types and ride options
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    
    if (type === 'vehicles') {
      // Fetch vehicle types from database
      const vehiclesRef = collection(db, 'vehicleTypes');
      const vehiclesSnapshot = await getDocs(query(vehiclesRef, where('available', '==', true), orderBy('basePrice')));
      
      const vehicles: VehicleType[] = [];
      vehiclesSnapshot.forEach((doc) => {
        vehicles.push({ id: doc.id, ...doc.data() } as VehicleType);
      });
      
      // If no vehicles in database, return default data
      if (vehicles.length === 0) {
        const defaultVehicles: VehicleType[] = [
          {
            id: '1',
            name: 'EcoRide',
            description: 'Affordable and eco-friendly',
            basePrice: 5.00,
            pricePerMile: 1.20,
            capacity: 4,
            features: ['Eco-friendly', 'Standard comfort'],
            estimatedArrival: '5-8 min',
            available: true
          },
          {
            id: '2',
            name: 'ComfortPlus',
            description: 'Premium comfort with extra space',
            basePrice: 8.00,
            pricePerMile: 1.80,
            capacity: 4,
            features: ['Premium comfort', 'Extra legroom', 'Climate control'],
            estimatedArrival: '3-6 min',
            available: true
          },
          {
            id: '3',
            name: 'LuxuryXL',
            description: 'Luxury vehicle for special occasions',
            basePrice: 15.00,
            pricePerMile: 3.50,
            capacity: 6,
            features: ['Luxury interior', 'Professional driver', 'Complimentary water'],
            estimatedArrival: '8-12 min',
            available: true
          },
          {
            id: '4',
            name: 'GroupRide',
            description: 'Perfect for larger groups',
            basePrice: 12.00,
            pricePerMile: 2.20,
            capacity: 8,
            features: ['Large capacity', 'Group-friendly', 'Extra storage'],
            estimatedArrival: '10-15 min',
            available: true
          }
        ];
        return NextResponse.json({ success: true, data: defaultVehicles });
      }
      
      return NextResponse.json({ success: true, data: vehicles });
    }
    
    if (type === 'stats') {
      // Fetch ride statistics
      const ridesRef = collection(db, 'rides');
      const ridesSnapshot = await getDocs(ridesRef);
      
      let totalRides = 0;
      let totalRating = 0;
      let ratingCount = 0;
      
      ridesSnapshot.forEach((doc) => {
        const ride = doc.data();
        totalRides++;
        if (ride.rating) {
          totalRating += ride.rating;
          ratingCount++;
        }
      });
      
      const averageRating = ratingCount > 0 ? totalRating / ratingCount : 4.9;
      
      const stats = {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        totalRides: totalRides || 10000, // Default to 10000 if no rides
        averagePickupTime: 5 // This could be calculated from actual pickup times
      };
      
      return NextResponse.json({ success: true, data: stats });
    }
    
    // Default: return all ride-related data
    const ridesRef = collection(db, 'rides');
    const ridesSnapshot = await getDocs(query(ridesRef, orderBy('createdAt', 'desc')));
    
    const rides: any[] = [];
    ridesSnapshot.forEach((doc) => {
      rides.push({ id: doc.id, ...doc.data() });
    });
    
    return NextResponse.json({ success: true, data: rides });
    
  } catch (error) {
    console.error('Error fetching rides data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rides data' },
      { status: 500 }
    );
  }
}

// POST - Create a new ride request
export async function POST(req: NextRequest) {
  try {
    const body: RideRequest = await req.json();
    
    // Validate required fields
    if (!body.pickupLocation || !body.destination || !body.vehicleType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create ride request
    const rideData = {
      ...body,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const ridesRef = collection(db, 'rides');
    const docRef = await addDoc(ridesRef, rideData);
    
    return NextResponse.json({
      success: true,
      data: { id: docRef.id, ...rideData }
    });
    
  } catch (error) {
    console.error('Error creating ride request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create ride request' },
      { status: 500 }
    );
  }
}