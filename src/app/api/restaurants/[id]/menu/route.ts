import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get restaurant info
    const restaurantRef = doc(db, 'restaurants', id);
    const restaurantSnap = await getDoc(restaurantRef);
    
    let restaurant = null;
    if (restaurantSnap.exists()) {
      restaurant = { id: restaurantSnap.id, ...restaurantSnap.data() };
    }

    // Get menu items for this restaurant
    const menuQuery = query(
      collection(db, 'menu_items'),
      where('restaurantId', '==', id)
    );
    const menuSnapshot = await getDocs(menuQuery);
    const menuItems = menuSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // If no data found, return default data for known restaurants
    if (!restaurant && menuItems.length === 0) {
      if (id === 'broskis') {
        return NextResponse.json({
          success: true,
          data: {
            restaurant: {
              id: 'broskis',
              name: 'Broski\'s',
              category: 'American',
              description: 'Delicious American cuisine',
              image: '/images/restaurants/broskis.jpg',
              rating: 4.5,
              deliveryTime: '25-35 min',
              deliveryFee: 2.99
            },
            menu: [
              {
                id: '1',
                name: 'Classic Burger',
                description: 'Juicy beef patty with lettuce, tomato, and special sauce',
                price: 12.99,
                category: 'Burgers',
                image: '/images/menu/burger.jpg',
                popular: true
              },
              {
                id: '2',
                name: 'Chicken Wings',
                description: 'Crispy wings with your choice of sauce',
                price: 9.99,
                category: 'Appetizers',
                image: '/images/menu/wings.jpg',
                popular: true
              }
            ]
          }
        });
      }
      
      return NextResponse.json(
        { success: false, error: 'Restaurant or menu not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        restaurant: restaurant || { id, name: 'Restaurant' },
        menu: menuItems
      }
    });
  } catch (error) {
    console.error('Error fetching restaurant menu:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}