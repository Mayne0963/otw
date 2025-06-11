import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Default catering packages data
const DEFAULT_PACKAGES = [
  {
    id: 'corporate-lunch',
    name: 'Corporate Lunch Package',
    description: 'Perfect for business meetings and corporate events',
    price: 'From $25 per person',
    minGuests: 10,
    maxGuests: 50,
    features: [
      'Assorted sandwiches and wraps',
      'Fresh salads',
      'Beverages included',
      'Professional setup',
      'Disposable plates and utensils'
    ],
    image: '/images/corporate-lunch.jpg',
    category: 'corporate'
  },
  {
    id: 'wedding-reception',
    name: 'Wedding Reception Package',
    description: 'Make your special day unforgettable with our premium catering',
    price: 'From $75 per person',
    minGuests: 50,
    maxGuests: 200,
    features: [
      'Multi-course plated dinner',
      'Cocktail hour appetizers',
      'Wedding cake service',
      'Professional wait staff',
      'Elegant table settings',
      'Complimentary champagne toast'
    ],
    image: '/images/wedding-reception.jpg',
    category: 'wedding'
  },
  {
    id: 'birthday-party',
    name: 'Birthday Party Package',
    description: 'Celebrate in style with our fun and festive catering options',
    price: 'From $35 per person',
    minGuests: 15,
    maxGuests: 75,
    features: [
      'Buffet-style setup',
      'Birthday cake included',
      'Party decorations',
      'Kid-friendly options',
      'Fun activities coordination'
    ],
    image: '/images/birthday-party.jpg',
    category: 'celebration'
  },
  {
    id: 'holiday-gathering',
    name: 'Holiday Gathering Package',
    description: 'Seasonal specialties for your holiday celebrations',
    price: 'From $45 per person',
    minGuests: 20,
    maxGuests: 100,
    features: [
      'Seasonal menu items',
      'Holiday-themed decorations',
      'Traditional holiday desserts',
      'Festive beverage options',
      'Custom menu planning'
    ],
    image: '/images/holiday-gathering.jpg',
    category: 'holiday'
  }
];

export async function GET(request: NextRequest) {
  try {
    // Try to fetch catering packages from Firestore
    const packagesRef = collection(db, 'catering-packages');
    const snapshot = await getDocs(packagesRef);
    
    if (!snapshot.empty) {
      const packages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return NextResponse.json({ packages });
    }
    
    // If no packages found in Firestore, return default data
    return NextResponse.json({ packages: DEFAULT_PACKAGES });
    
  } catch (error) {
    console.error('Error fetching catering packages:', error);
    
    // Return default data on error
    return NextResponse.json({ packages: DEFAULT_PACKAGES });
  }
}

// Placeholder for future POST functionality
export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'POST method not implemented yet' }, { status: 501 });
}