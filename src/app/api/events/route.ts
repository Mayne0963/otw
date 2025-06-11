import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { collection, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: {
    name: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  category: string;
  price: number;
  capacity: number;
  registered: number;
  image: string;
  organizer: string;
  tags: string[];
  featured: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

// GET - Retrieve events
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const featured = searchParams.get('featured');

    // Build query
    let eventsQuery = query(collection(db, 'events'), orderBy('date', 'asc'));

    if (category) {
      eventsQuery = query(collection(db, 'events'), where('category', '==', category), orderBy('date', 'asc'));
    }

    if (featured === 'true') {
      eventsQuery = query(collection(db, 'events'), where('featured', '==', true), orderBy('date', 'asc'));
    }

    const eventsSnapshot = await getDocs(eventsQuery);
    const events: Event[] = [];
    
    eventsSnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() } as Event);
    });

    // If no events in database, return default data
    if (events.length === 0) {
      const defaultEvents: Event[] = [
        {
          id: '1',
          title: 'Food Truck Festival',
          description: 'Join us for a celebration of local food trucks and street food vendors.',
          date: '2024-02-15',
          time: '11:00 AM - 8:00 PM',
          location: {
            name: 'Central Park',
            address: '123 Park Avenue, New York, NY 10001'
          },
          category: 'Festival',
          price: 0,
          capacity: 500,
          registered: 234,
          image: '/assets/images/placeholder.jpg',
          organizer: 'OTW Events',
          tags: ['food', 'festival', 'family-friendly'],
          featured: true,
          status: 'upcoming'
        },
        {
          id: '2',
          title: 'Cooking Workshop: Italian Cuisine',
          description: 'Learn to make authentic Italian pasta and sauces with our expert chef.',
          date: '2024-02-20',
          time: '2:00 PM - 5:00 PM',
          location: {
            name: 'Culinary Institute',
            address: '456 Chef Street, New York, NY 10002'
          },
          category: 'Workshop',
          price: 75,
          capacity: 20,
          registered: 15,
          image: '/assets/images/placeholder.jpg',
          organizer: 'Chef Maria',
          tags: ['cooking', 'italian', 'hands-on'],
          featured: false,
          status: 'upcoming'
        },
        {
          id: '3',
          title: 'Wine Tasting Evening',
          description: 'Discover exceptional wines from around the world with our sommelier.',
          date: '2024-02-25',
          time: '6:00 PM - 9:00 PM',
          location: {
            name: 'Wine Bar & Bistro',
            address: '789 Vine Street, New York, NY 10003'
          },
          category: 'Tasting',
          price: 50,
          capacity: 30,
          registered: 22,
          image: '/assets/images/placeholder.jpg',
          organizer: 'Sommelier John',
          tags: ['wine', 'tasting', 'adult'],
          featured: true,
          status: 'upcoming'
        }
      ];
      
      return NextResponse.json({ success: true, data: defaultEvents });
    }

    return NextResponse.json({ success: true, data: events });

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST - Create new event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventData: Omit<Event, 'id'> = body;

    // Validate required fields
    if (!eventData.title || !eventData.date || !eventData.location?.name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add timestamp
    const newEventData = {
      ...eventData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const eventsRef = collection(db, 'events');
    const docRef = await addDoc(eventsRef, newEventData);

    return NextResponse.json({
      success: true,
      data: { id: docRef.id, ...newEventData }
    });

  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    );
  }
}