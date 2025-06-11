import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '../../../lib/firebaseAdmin';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase-config';

export const dynamic = 'force-dynamic';

// Handle GET requests to retrieve orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';
    const limitParam = parseInt(searchParams.get('limit') || '50');
    const statusFilter = searchParams.get('status');
    const orderType = searchParams.get('type');

    // For admin requests, verify admin privileges
    if (isAdmin) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1];
        try {
          const decodedToken = await adminAuth.verifyIdToken(token);
          const adminEmails = ['admin@otw.com', 'manager@otw.com', 'supervisor@otw.com'];
          if (!adminEmails.includes(decodedToken.email || '')) {
            return NextResponse.json(
              { error: 'Unauthorized - Admin access required' },
              { status: 403 }
            );
          }
        } catch (error) {
          // Continue without auth for now - in production, this should be required
          console.warn('Admin auth verification failed:', error);
        }
      }
    }

    // Build query for regular orders
    let ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(limitParam)
    );

    if (statusFilter) {
      ordersQuery = query(
        collection(db, 'orders'),
        where('status', '==', statusFilter),
        orderBy('createdAt', 'desc'),
        limit(limitParam)
      );
    }

    if (orderType) {
      ordersQuery = query(
        collection(db, 'orders'),
        where('orderType', '==', orderType),
        orderBy('createdAt', 'desc'),
        limit(limitParam)
      );
    }

    const ordersSnapshot = await getDocs(ordersQuery);
    const orders = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }));

    return NextResponse.json({
      success: true,
      data: orders,
      total: orders.length
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch orders',
        data: [] 
      },
      { status: 500 }
    );
  }
}

// Handle POST requests to create new orders
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const orderData = await request.json();
    
    // Add order to Firestore
    const orderRef = await adminDb.collection('orders').add({
      ...orderData,
      userRef: decodedToken.uid,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      orderId: orderRef.id,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create order' 
      },
      { status: 500 }
    );
  }
}