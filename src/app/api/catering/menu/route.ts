import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Default catering menu items data
const DEFAULT_MENU_ITEMS = [
  {
    id: 'gourmet-sandwiches',
    name: 'Gourmet Sandwich Platter',
    description: 'Assorted premium sandwiches with artisan breads',
    price: '$12.99 per person',
    category: 'appetizers',
    servingSize: '2-3 pieces per person',
    dietaryInfo: ['Vegetarian options available'],
    image: '/images/sandwich-platter.jpg'
  },
  {
    id: 'caesar-salad',
    name: 'Caesar Salad Bowl',
    description: 'Fresh romaine lettuce with parmesan and croutons',
    price: '$8.99 per person',
    category: 'salads',
    servingSize: '1 serving per person',
    dietaryInfo: ['Vegetarian', 'Gluten-free option'],
    image: '/images/caesar-salad.jpg'
  },
  {
    id: 'grilled-chicken',
    name: 'Grilled Chicken Breast',
    description: 'Herb-marinated chicken breast with seasonal vegetables',
    price: '$18.99 per person',
    category: 'mains',
    servingSize: '6oz per person',
    dietaryInfo: ['Gluten-free', 'High protein'],
    image: '/images/grilled-chicken.jpg'
  },
  {
    id: 'pasta-primavera',
    name: 'Pasta Primavera',
    description: 'Fresh vegetables tossed with penne pasta in garlic olive oil',
    price: '$14.99 per person',
    category: 'mains',
    servingSize: '1 serving per person',
    dietaryInfo: ['Vegetarian', 'Vegan option available'],
    image: '/images/pasta-primavera.jpg'
  },
  {
    id: 'fruit-platter',
    name: 'Seasonal Fruit Platter',
    description: 'Fresh seasonal fruits beautifully arranged',
    price: '$6.99 per person',
    category: 'desserts',
    servingSize: '1 serving per person',
    dietaryInfo: ['Vegan', 'Gluten-free', 'Healthy'],
    image: '/images/fruit-platter.jpg'
  },
  {
    id: 'chocolate-cake',
    name: 'Chocolate Layer Cake',
    description: 'Rich chocolate cake with chocolate ganache',
    price: '$4.99 per person',
    category: 'desserts',
    servingSize: '1 slice per person',
    dietaryInfo: ['Contains dairy', 'Contains gluten'],
    image: '/images/chocolate-cake.jpg'
  },
  {
    id: 'coffee-service',
    name: 'Premium Coffee Service',
    description: 'Freshly brewed coffee with cream, sugar, and alternatives',
    price: '$3.99 per person',
    category: 'beverages',
    servingSize: '2 cups per person',
    dietaryInfo: ['Caffeine', 'Dairy-free options'],
    image: '/images/coffee-service.jpg'
  },
  {
    id: 'sparkling-water',
    name: 'Sparkling Water Station',
    description: 'Assorted sparkling waters with fruit garnishes',
    price: '$2.99 per person',
    category: 'beverages',
    servingSize: '2 bottles per person',
    dietaryInfo: ['Zero calories', 'Refreshing'],
    image: '/images/sparkling-water.jpg'
  }
];

export async function GET(request: NextRequest) {
  try {
    // Try to fetch catering menu items from Firestore
    const menuRef = collection(db, 'catering-menu');
    const snapshot = await getDocs(menuRef);
    
    if (!snapshot.empty) {
      const menuItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return NextResponse.json({ menuItems });
    }
    
    // If no menu items found in Firestore, return default data
    return NextResponse.json({ menuItems: DEFAULT_MENU_ITEMS });
    
  } catch (error) {
    console.error('Error fetching catering menu items:', error);
    
    // Return default data on error
    return NextResponse.json({ menuItems: DEFAULT_MENU_ITEMS });
  }
}

// Placeholder for future POST functionality
export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'POST method not implemented yet' }, { status: 501 });
}