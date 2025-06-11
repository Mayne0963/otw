import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, addDoc, query, where, limit as firestoreLimit } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const isPartner = searchParams.get('isPartner');
    const limit = searchParams.get('limit');

    let restaurantsQuery = collection(db, 'restaurants');
    const constraints = [];

    if (category) {
      constraints.push(where('category', '==', category));
    }
    if (featured !== null) {
      constraints.push(where('featured', '==', featured === 'true'));
    }
    if (isPartner !== null) {
      constraints.push(where('isPartner', '==', isPartner === 'true'));
    }
    if (limit) {
      constraints.push(firestoreLimit(parseInt(limit)));
    }

    if (constraints.length > 0) {
      restaurantsQuery = query(restaurantsQuery, ...constraints);
    }

    const querySnapshot = await getDocs(restaurantsQuery);
    const restaurants = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // If no restaurants found, return default data
    if (restaurants.length === 0) {
      const defaultRestaurants = [
        {
          id: 'broskis',
          name: 'Broski\'s',
          category: 'American',
          featured: true,
          isPartner: true,
          description: 'Delicious American cuisine',
          image: '/images/restaurants/broskis.jpg',
          rating: 4.5,
          deliveryTime: '25-35 min',
          deliveryFee: 2.99
        }
      ];
      
      return NextResponse.json({
        success: true,
        data: defaultRestaurants,
        count: defaultRestaurants.length
      });
    }

    return NextResponse.json({
      success: true,
      data: restaurants,
      count: restaurants.length
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch restaurants' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const restaurantData = await request.json();
    
    const docRef = await addDoc(collection(db, 'restaurants'), {
      ...restaurantData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: { id: docRef.id, ...restaurantData }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create restaurant' },
      { status: 500 }
    );
  }
}