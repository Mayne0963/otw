import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { collection, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

interface MembershipTier {
  id: string;
  name: string;
  description: string;
  minPoints: number;
  benefits: string[];
  color: string;
  icon: string;
  active: boolean;
}

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  membershipTier: string;
  date: string;
  verified: boolean;
}

interface LoyaltyUpdate {
  userId: string;
  points: number;
  action: 'earn' | 'redeem';
  description: string;
}

// GET - Retrieve membership tiers and testimonials
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (type === 'tiers') {
      // Fetch membership tiers from database
      const tiersRef = collection(db, 'membershipTiers');
      const tiersSnapshot = await getDocs(query(tiersRef, where('active', '==', true), orderBy('minPoints')));

      const tiers: MembershipTier[] = [];
      tiersSnapshot.forEach((doc) => {
        tiers.push({ id: doc.id, ...doc.data() } as MembershipTier);
      });

      // If no tiers in database, return default data
      if (tiers.length === 0) {
        const defaultTiers: MembershipTier[] = [
          {
            id: '1',
            name: 'Bronze',
            description: 'Start your journey with basic rewards',
            minPoints: 0,
            benefits: [
              '5% cashback on orders',
              'Free delivery on orders over $25',
              'Birthday discount',
            ],
            color: '#CD7F32',
            icon: '🥉',
            active: true,
          },
          {
            id: '2',
            name: 'Silver',
            description: 'Enhanced benefits for regular customers',
            minPoints: 500,
            benefits: [
              '8% cashback on orders',
              'Free delivery on orders over $15',
              'Priority customer support',
              'Monthly exclusive offers',
            ],
            color: '#C0C0C0',
            icon: '🥈',
            active: true,
          },
          {
            id: '3',
            name: 'Gold',
            description: 'Premium rewards for loyal customers',
            minPoints: 1500,
            benefits: [
              '12% cashback on orders',
              'Free delivery on all orders',
              'Priority customer support',
              'Weekly exclusive offers',
              'Early access to new features',
            ],
            color: '#FFD700',
            icon: '🥇',
            active: true,
          },
          {
            id: '4',
            name: 'Platinum',
            description: 'Ultimate rewards for VIP customers',
            minPoints: 3000,
            benefits: [
              '15% cashback on orders',
              'Free delivery on all orders',
              'Dedicated VIP support',
              'Daily exclusive offers',
              'Early access to new features',
              'Personal account manager',
            ],
            color: '#E5E4E2',
            icon: '💎',
            active: true,
          },
        ];
        return NextResponse.json({ success: true, data: defaultTiers });
      }

      return NextResponse.json({ success: true, data: tiers });
    }

    if (type === 'testimonials') {
      // Fetch testimonials from database
      const testimonialsRef = collection(db, 'testimonials');
      const testimonialsSnapshot = await getDocs(query(testimonialsRef, where('verified', '==', true), orderBy('date', 'desc')));

      const testimonials: Testimonial[] = [];
      testimonialsSnapshot.forEach((doc) => {
        testimonials.push({ id: doc.id, ...doc.data() } as Testimonial);
      });

      // If no testimonials in database, return default data
      if (testimonials.length === 0) {
        const defaultTestimonials: Testimonial[] = [
          {
            id: '1',
            name: 'Sarah Johnson',
            location: 'New York, NY',
            rating: 5,
            comment: 'The loyalty program is amazing! I\'ve saved so much money with the cashback rewards.',
            membershipTier: 'Gold',
            date: '2024-01-15',
            verified: true,
          },
          {
            id: '2',
            name: 'Mike Chen',
            location: 'San Francisco, CA',
            rating: 5,
            comment: 'Being a Platinum member has completely changed my experience. The VIP support is incredible!',
            membershipTier: 'Platinum',
            date: '2024-01-10',
            verified: true,
          },
          {
            id: '3',
            name: 'Emily Rodriguez',
            location: 'Austin, TX',
            rating: 4,
            comment: 'Love the exclusive offers I get as a Silver member. Great value for money!',
            membershipTier: 'Silver',
            date: '2024-01-08',
            verified: true,
          },
          {
            id: '4',
            name: 'David Kim',
            location: 'Seattle, WA',
            rating: 5,
            comment: 'The Bronze tier benefits are perfect for someone just starting out. Highly recommend!',
            membershipTier: 'Bronze',
            date: '2024-01-05',
            verified: true,
          },
        ];
        return NextResponse.json({ success: true, data: defaultTestimonials });
      }

      return NextResponse.json({ success: true, data: testimonials });
    }

    // Default: return all loyalty data
    const loyaltyRef = collection(db, 'loyaltyProgram');
    const loyaltySnapshot = await getDocs(query(loyaltyRef, orderBy('createdAt', 'desc')));

    const loyaltyData: any[] = [];
    loyaltySnapshot.forEach((doc) => {
      loyaltyData.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json({ success: true, data: loyaltyData });

  } catch (error) {
    console.error('Error fetching loyalty data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch loyalty data' },
      { status: 500 },
    );
  }
}

// POST - Update loyalty points or add testimonial
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, ...data } = body;

    if (type === 'loyalty-update') {
      const loyaltyUpdate: LoyaltyUpdate = data;

      // Validate required fields
      if (!loyaltyUpdate.userId || !loyaltyUpdate.points || !loyaltyUpdate.action) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields for loyalty update' },
          { status: 400 },
        );
      }

      // Create loyalty update record
      const updateData = {
        ...loyaltyUpdate,
        timestamp: new Date().toISOString(),
      };

      const loyaltyRef = collection(db, 'loyaltyProgram');
      const docRef = await addDoc(loyaltyRef, updateData);

      return NextResponse.json({
        success: true,
        data: { id: docRef.id, ...updateData },
      });
    }

    if (type === 'testimonial') {
      const testimonial: Omit<Testimonial, 'id'> = data;

      // Validate required fields
      if (!testimonial.name || !testimonial.comment || !testimonial.rating) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields for testimonial' },
          { status: 400 },
        );
      }

      // Create testimonial
      const testimonialData = {
        ...testimonial,
        date: new Date().toISOString().split('T')[0],
        verified: false, // Testimonials need to be verified before showing
      };

      const testimonialsRef = collection(db, 'testimonials');
      const docRef = await addDoc(testimonialsRef, testimonialData);

      return NextResponse.json({
        success: true,
        data: { id: docRef.id, ...testimonialData },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request type' },
      { status: 400 },
    );

  } catch (error) {
    console.error('Error processing loyalty request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process loyalty request' },
      { status: 500 },
    );
  }
}