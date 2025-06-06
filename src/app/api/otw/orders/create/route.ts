import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';

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

interface OrderData {
  serviceDetails: ServiceDetails;
  customerInfo: CustomerInfo;
  paymentMethod: 'contact' | 'card';
  cardDetails?: any;
  timestamp: string;
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify Firebase Admin is initialized
    if (!adminAuth || !adminDb) {
      console.error('Firebase Admin not initialized');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 },
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
        // Continue without user ID for guest orders
      }
    }

    // Parse request body
    const orderData: OrderData = await request.json();

    // Validate required fields
    if (!orderData.serviceDetails || !orderData.customerInfo || !orderData.paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required order information' },
        { status: 400 },
      );
    }

    // Validate customer information
    const { name, phone, email, address } = orderData.customerInfo;
    if (!name || !phone || !email || !address) {
      return NextResponse.json(
        { error: 'Missing required customer information' },
        { status: 400 },
      );
    }

    // Validate service details
    const { type, title, estimatedPrice } = orderData.serviceDetails;
    if (!type || !title || typeof estimatedPrice !== 'number') {
      return NextResponse.json(
        { error: 'Invalid service details' },
        { status: 400 },
      );
    }

    // Generate order ID
    const orderId = `OTW-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Create order document
    const order = {
      orderId,
      userId: userId || null,
      serviceDetails: orderData.serviceDetails,
      customerInfo: {
        name: orderData.customerInfo.name,
        phone: orderData.customerInfo.phone,
        email: orderData.customerInfo.email,
        address: orderData.customerInfo.address,
        specialInstructions: orderData.customerInfo.specialInstructions || '',
      },
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentMethod === 'contact' ? 'pending' : 'processing',
      orderStatus: 'pending',
      estimatedPrice: orderData.serviceDetails.estimatedPrice,
      actualPrice: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedHelper: null,
      completedAt: null,
      notes: [],
      metadata: {
        source: 'otw_web',
        userAgent: request.headers.get('user-agent') || '',
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      },
    };

    // Save order to Firestore
    try {
      await adminDb.collection('otw_orders').doc(orderId).set(order);

      // Also save to user's orders if authenticated
      if (userId) {
        await adminDb.collection('users').doc(userId).collection('otw_orders').doc(orderId).set({
          orderId,
          serviceType: orderData.serviceDetails.type,
          serviceTitle: orderData.serviceDetails.title,
          estimatedPrice: orderData.serviceDetails.estimatedPrice,
          paymentMethod: orderData.paymentMethod,
          orderStatus: 'pending',
          createdAt: new Date().toISOString(),
        });
      }

      console.log(`OTW Order created successfully: ${orderId}`);

      return NextResponse.json({
        success: true,
        orderId,
        message: 'Order created successfully',
        order: {
          orderId,
          serviceTitle: orderData.serviceDetails.title,
          estimatedPrice: orderData.serviceDetails.estimatedPrice,
          paymentMethod: orderData.paymentMethod,
          orderStatus: 'pending',
        },
      });
    } catch (firestoreError) {
      console.error('Firestore error:', firestoreError);
      return NextResponse.json(
        { error: 'Failed to save order' },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 },
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 },
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 },
  );
}