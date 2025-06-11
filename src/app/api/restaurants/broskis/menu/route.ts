import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    // Get menu items from Firestore
    const menuRef = collection(db, 'restaurants', 'broskis', 'menu');
    const menuQuery = query(menuRef, orderBy('category'), orderBy('name'));
    const menuSnap = await getDocs(menuQuery);

    if (!menuSnap.empty) {
      const menuItems = menuSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return NextResponse.json(menuItems);
    } else {
      // Return default menu if not found in Firestore
      const defaultMenu = [
        {
          id: '1',
          name: 'Classic Broski Burger',
          description: 'Juicy beef patty with lettuce, tomato, onion, and our signature sauce',
          price: 14.99,
          category: 'Burgers',
          image: '/images/burger-classic.jpg',
          popular: true,
          spicy: false,
          vegetarian: false
        },
        {
          id: '2',
          name: 'Spicy Jalapeño Burger',
          description: 'Beef patty with jalapeños, pepper jack cheese, and spicy mayo',
          price: 16.99,
          category: 'Burgers',
          image: '/images/burger-spicy.jpg',
          popular: false,
          spicy: true,
          vegetarian: false
        },
        {
          id: '3',
          name: 'Veggie Delight Burger',
          description: 'Plant-based patty with avocado, sprouts, and herb aioli',
          price: 15.99,
          category: 'Burgers',
          image: '/images/burger-veggie.jpg',
          popular: false,
          spicy: false,
          vegetarian: true
        },
        {
          id: '4',
          name: 'BBQ Bacon Burger',
          description: 'Beef patty with crispy bacon, BBQ sauce, and onion rings',
          price: 17.99,
          category: 'Burgers',
          image: '/images/burger-bbq.jpg',
          popular: true,
          spicy: false,
          vegetarian: false
        },
        {
          id: '5',
          name: 'Loaded Nachos',
          description: 'Crispy tortilla chips with cheese, jalapeños, sour cream, and guacamole',
          price: 12.99,
          category: 'Appetizers',
          image: '/images/nachos.jpg',
          popular: true,
          spicy: true,
          vegetarian: true
        },
        {
          id: '6',
          name: 'Buffalo Wings',
          description: '8 pieces of crispy wings tossed in buffalo sauce',
          price: 13.99,
          category: 'Appetizers',
          image: '/images/wings.jpg',
          popular: false,
          spicy: true,
          vegetarian: false
        },
        {
          id: '7',
          name: 'Mozzarella Sticks',
          description: '6 pieces of golden fried mozzarella with marinara sauce',
          price: 9.99,
          category: 'Appetizers',
          image: '/images/mozzarella-sticks.jpg',
          popular: false,
          spicy: false,
          vegetarian: true
        },
        {
          id: '8',
          name: 'Caesar Salad',
          description: 'Fresh romaine lettuce with parmesan, croutons, and caesar dressing',
          price: 11.99,
          category: 'Salads',
          image: '/images/caesar-salad.jpg',
          popular: false,
          spicy: false,
          vegetarian: true
        },
        {
          id: '9',
          name: 'Grilled Chicken Salad',
          description: 'Mixed greens with grilled chicken, tomatoes, and balsamic vinaigrette',
          price: 14.99,
          category: 'Salads',
          image: '/images/chicken-salad.jpg',
          popular: false,
          spicy: false,
          vegetarian: false
        },
        {
          id: '10',
          name: 'Chocolate Brownie',
          description: 'Warm chocolate brownie with vanilla ice cream',
          price: 7.99,
          category: 'Desserts',
          image: '/images/brownie.jpg',
          popular: true,
          spicy: false,
          vegetarian: true
        },
        {
          id: '11',
          name: 'Cheesecake',
          description: 'Classic New York style cheesecake with berry compote',
          price: 8.99,
          category: 'Desserts',
          image: '/images/cheesecake.jpg',
          popular: false,
          spicy: false,
          vegetarian: true
        },
        {
          id: '12',
          name: 'Craft Beer',
          description: 'Local craft beer selection',
          price: 5.99,
          category: 'Beverages',
          image: '/images/beer.jpg',
          popular: false,
          spicy: false,
          vegetarian: true
        },
        {
          id: '13',
          name: 'Fresh Lemonade',
          description: 'House-made lemonade with fresh lemons',
          price: 3.99,
          category: 'Beverages',
          image: '/images/lemonade.jpg',
          popular: false,
          spicy: false,
          vegetarian: true
        },
        {
          id: '14',
          name: 'Iced Coffee',
          description: 'Cold brew coffee served over ice',
          price: 4.99,
          category: 'Beverages',
          image: '/images/iced-coffee.jpg',
          popular: false,
          spicy: false,
          vegetarian: true
        }
      ];

      return NextResponse.json(defaultMenu);
    }
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Here you could add logic to create/update menu items
    // For now, we'll just return success
    return NextResponse.json({ success: true, message: 'Menu item created/updated' });
  } catch (error) {
    console.error('Error updating menu:', error);
    return NextResponse.json(
      { error: 'Failed to update menu item' },
      { status: 500 }
    );
  }
}