import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

interface ServiceDetails {
  type: 'grocery' | 'rides' | 'package';
  title: string;
  description: string;
  estimatedPrice: number;
  serviceDetails: any;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  specialInstructions: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify Firebase Admin is initialized
    if (!adminAuth || !adminDb) {
      console.error('Firebase Admin not initialized');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe secret key not configured');
      return NextResponse.json(
        { error: 'Payment processing not configured' },
        { status: 500 }
      );
    }

    // Get and verify the authorization token
    const authHeader = request.headers.get('authorization');
    let userId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decodedToken = await adminAuth.verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (error) {
        console.error('Token verification failed:', error);
        // Continue without user ID for guest checkout
      }
    }

    // Parse request body
    const { serviceDetails, customerInfo, amount }: {
      serviceDetails: ServiceDetails;
      customerInfo: CustomerInfo;
      amount: number;
    } = await request.json();

    // Validate required fields
    if (!serviceDetails || !customerInfo || !amount) {
      return NextResponse.json(
        { error: 'Missing required checkout information' },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Validate customer information
    const { name, phone, email, address } = customerInfo;
    if (!name || !phone || !email || !address) {
      return NextResponse.json(
        { error: 'Missing required customer information' },
        { status: 400 }
      );
    }

    // Generate order ID for tracking
    const orderId = `OTW-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: serviceDetails.title,
              description: serviceDetails.description,
              metadata: {
                service_type: serviceDetails.type,
                order_id: orderId
              }
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/otw/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/otw/checkout?service=${serviceDetails.type}`,
      customer_email: customerInfo.email,
      metadata: {
        order_id: orderId,
        user_id: userId || 'guest',
        service_type: serviceDetails.type,
        service_title: serviceDetails.title,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        special_instructions: customerInfo.specialInstructions || '',
        source: 'otw_web'
      },
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      phone_number_collection: {
        enabled: true,
      },
      custom_fields: [
        {
          key: 'service_address',
          label: {
            type: 'custom',
            custom: 'Service Address',
          },
          type: 'text',
          text: {
            default_value: customerInfo.address
          }
        }
      ]
    });

    // Create pending order record
    const orderData = {
      orderId,
      userId: userId || null,
      serviceDetails,
      customerInfo,
      paymentMethod: 'card',
      paymentStatus: 'pending',
      orderStatus: 'pending_payment',
      estimatedPrice: serviceDetails.estimatedPrice,
      actualPrice: amount / 100, // Convert from cents
      stripeSessionId: session.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedHelper: null,
      completedAt: null,
      notes: [],
      metadata: {
        source: 'otw_web',
        userAgent: request.headers.get('user-agent') || '',
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    };

    // Save pending order to Firestore
    try {
      await adminDb.collection('otw_orders').doc(orderId).set(orderData);
      
      // Also save to user's orders if authenticated
      if (userId) {
        await adminDb.collection('users').doc(userId).collection('otw_orders').doc(orderId).set({
          orderId,
          serviceType: serviceDetails.type,
          serviceTitle: serviceDetails.title,
          estimatedPrice: serviceDetails.estimatedPrice,
          paymentMethod: 'card',
          orderStatus: 'pending_payment',
          stripeSessionId: session.id,
          createdAt: new Date().toISOString()
        });
      }

      console.log(`OTW Stripe session created: ${session.id} for order: ${orderId}`);
      
      return NextResponse.json({
        sessionId: session.id,
        url: session.url,
        orderId
      });
    } catch (firestoreError) {
      console.error('Firestore error:', firestoreError);
      return NextResponse.json(
        { error: 'Failed to create order record' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Stripe checkout session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}