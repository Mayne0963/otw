import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, getDocs, addDoc, query, where, orderBy } from "firebase/firestore";

export const dynamic = "force-dynamic";

interface DeliveryService {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  pricePerMile: number;
  maxWeight: number;
  maxDimensions: string;
  estimatedDelivery: string;
  features: string[];
  available: boolean;
}

interface PackageType {
  id: string;
  name: string;
  description: string;
  maxWeight: number;
  maxDimensions: string;
  handling: string;
  available: boolean;
}

interface PackageRequest {
  pickupAddress: string;
  deliveryAddress: string;
  packageType: string;
  deliveryService: string;
  weight: number;
  dimensions: string;
  specialInstructions?: string;
  scheduledPickup?: string;
}

// GET - Retrieve delivery services and package types
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    
    if (type === 'services') {
      // Fetch delivery services from database
      const servicesRef = collection(db, 'deliveryServices');
      const servicesSnapshot = await getDocs(query(servicesRef, where('available', '==', true), orderBy('basePrice')));
      
      const services: DeliveryService[] = [];
      servicesSnapshot.forEach((doc) => {
        services.push({ id: doc.id, ...doc.data() } as DeliveryService);
      });
      
      // If no services in database, return default data
      if (services.length === 0) {
        const defaultServices: DeliveryService[] = [
          {
            id: '1',
            name: 'Standard Delivery',
            description: 'Reliable delivery within 24-48 hours',
            basePrice: 8.99,
            pricePerMile: 0.75,
            maxWeight: 50,
            maxDimensions: '24" x 18" x 12"',
            estimatedDelivery: '1-2 business days',
            features: ['Tracking included', 'Insurance up to $100'],
            available: true
          },
          {
            id: '2',
            name: 'Express Delivery',
            description: 'Fast delivery within 4-6 hours',
            basePrice: 15.99,
            pricePerMile: 1.25,
            maxWeight: 30,
            maxDimensions: '20" x 16" x 10"',
            estimatedDelivery: '4-6 hours',
            features: ['Real-time tracking', 'Priority handling', 'Insurance up to $200'],
            available: true
          },
          {
            id: '3',
            name: 'Same Day Delivery',
            description: 'Ultra-fast delivery within 2-3 hours',
            basePrice: 25.99,
            pricePerMile: 2.00,
            maxWeight: 20,
            maxDimensions: '18" x 14" x 8"',
            estimatedDelivery: '2-3 hours',
            features: ['Live tracking', 'Immediate pickup', 'Insurance up to $300'],
            available: true
          },
          {
            id: '4',
            name: 'Fragile Handling',
            description: 'Specialized service for delicate items',
            basePrice: 18.99,
            pricePerMile: 1.50,
            maxWeight: 25,
            maxDimensions: '16" x 12" x 10"',
            estimatedDelivery: '6-8 hours',
            features: ['Fragile handling', 'Extra padding', 'Insurance up to $500'],
            available: true
          }
        ];
        return NextResponse.json({ success: true, data: defaultServices });
      }
      
      return NextResponse.json({ success: true, data: services });
    }
    
    if (type === 'package-types') {
      // Fetch package types from database
      const typesRef = collection(db, 'packageTypes');
      const typesSnapshot = await getDocs(query(typesRef, where('available', '==', true)));
      
      const packageTypes: PackageType[] = [];
      typesSnapshot.forEach((doc) => {
        packageTypes.push({ id: doc.id, ...doc.data() } as PackageType);
      });
      
      // If no package types in database, return default data
      if (packageTypes.length === 0) {
        const defaultPackageTypes: PackageType[] = [
          {
            id: '1',
            name: 'Small Package',
            description: 'Documents, small items',
            maxWeight: 5,
            maxDimensions: '12" x 9" x 3"',
            handling: 'Standard',
            available: true
          },
          {
            id: '2',
            name: 'Medium Package',
            description: 'Books, clothing, small electronics',
            maxWeight: 20,
            maxDimensions: '18" x 14" x 8"',
            handling: 'Standard',
            available: true
          },
          {
            id: '3',
            name: 'Large Package',
            description: 'Large items, multiple products',
            maxWeight: 50,
            maxDimensions: '24" x 18" x 12"',
            handling: 'Careful',
            available: true
          },
          {
            id: '4',
            name: 'Fragile Package',
            description: 'Delicate items requiring special care',
            maxWeight: 15,
            maxDimensions: '16" x 12" x 8"',
            handling: 'Fragile',
            available: true
          }
        ];
        return NextResponse.json({ success: true, data: defaultPackageTypes });
      }
      
      return NextResponse.json({ success: true, data: packageTypes });
    }
    
    // Default: return all package delivery data
    const packagesRef = collection(db, 'packages');
    const packagesSnapshot = await getDocs(query(packagesRef, orderBy('createdAt', 'desc')));
    
    const packages: any[] = [];
    packagesSnapshot.forEach((doc) => {
      packages.push({ id: doc.id, ...doc.data() });
    });
    
    return NextResponse.json({ success: true, data: packages });
    
  } catch (error) {
    console.error('Error fetching package data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch package data' },
      { status: 500 }
    );
  }
}

// POST - Create a new package delivery request
export async function POST(req: NextRequest) {
  try {
    const body: PackageRequest = await req.json();
    
    // Validate required fields
    if (!body.pickupAddress || !body.deliveryAddress || !body.packageType || !body.deliveryService) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create package delivery request
    const packageData = {
      ...body,
      status: 'pending',
      trackingNumber: `PKG${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const packagesRef = collection(db, 'packages');
    const docRef = await addDoc(packagesRef, packageData);
    
    return NextResponse.json({
      success: true,
      data: { id: docRef.id, ...packageData }
    });
    
  } catch (error) {
    console.error('Error creating package request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create package request' },
      { status: 500 }
    );
  }
}