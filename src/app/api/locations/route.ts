import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, addDoc, query, where, limit as firestoreLimit } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');

    let locationsQuery = collection(db, 'locations');
    const constraints = [];

    if (city) {
      constraints.push(where('city', '==', city));
    }
    if (state) {
      constraints.push(where('state', '==', state));
    }
    if (featured !== null) {
      constraints.push(where('featured', '==', featured === 'true'));
    }
    if (limit) {
      constraints.push(firestoreLimit(parseInt(limit)));
    }

    if (constraints.length > 0) {
      locationsQuery = query(locationsQuery, ...constraints);
    }

    const querySnapshot = await getDocs(locationsQuery);
    const locations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // If no locations found, return default data
    if (locations.length === 0) {
      const defaultLocations = [
        {
          id: 'fort-wayne',
          name: 'Fort Wayne',
          city: 'Fort Wayne',
          state: 'Indiana',
          featured: true,
          description: 'Our main service area in Fort Wayne, Indiana',
          coordinates: {
            lat: 41.0793,
            lng: -85.1394
          },
          serviceAreas: ['Downtown', 'Southwest', 'Northeast']
        }
      ];
      
      return NextResponse.json(defaultLocations);
    }

    return NextResponse.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const locationData = await request.json();
    
    const docRef = await addDoc(collection(db, 'locations'), {
      ...locationData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const newLocation = {
      id: docRef.id,
      ...locationData
    };

    return NextResponse.json(newLocation, { status: 201 });
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}