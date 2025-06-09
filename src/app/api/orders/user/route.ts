import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '../../../../lib/firebaseAdmin';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../../lib/firebase-config';

export const dynamic = 'force-dynamic';

// Handle GET requests to retrieve user's order history
export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
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
      // Verify the Firebase ID token
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;

    const { searchParams } = new URL(request.url);
    const limitParam = parseInt(searchParams.get('limit') || '20');
    const offsetParam = parseInt(searchParams.get('offset') || '0');
    const statusFilter = searchParams.get('status');

    // Fetch regular orders from Firestore
    let regularOrdersQuery = query(
      collection(db, 'orders'),
      where('userRef', '==', userId),
      orderBy('createdAt', 'desc')
    );

    if (statusFilter) {
      regularOrdersQuery = query(
        collection(db, 'orders'),
        where('userRef', '==', userId),
        where('status', '==', statusFilter),
        orderBy('createdAt', 'desc')
      );
    }

    const regularOrdersSnapshot = await getDocs(regularOrdersQuery);
    const regularOrders = regularOrdersSnapshot.docs.map(doc => ({
      id: doc.id,
      type: 'regular',
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }));

    // Fetch screenshot orders using admin SDK for better querying
    let screenshotOrdersQuery = adminDb.collection('screenshot_orders')
      .where('customerInfo.email', '==', userEmail)
      .orderBy('timestamps.created', 'desc');

    if (statusFilter) {
      screenshotOrdersQuery = screenshotOrdersQuery.where('status', '==', statusFilter);
    }

    const screenshotOrdersSnapshot = await screenshotOrdersQuery.get();
    const screenshotOrders = screenshotOrdersSnapshot.docs.map(doc => ({
      id: doc.id,
      type: 'screenshot',
      ...doc.data(),
      createdAt: new Date(doc.data().timestamps?.created || Date.now())
    }));

    // Combine and sort all orders by creation date
    const allOrders = [...regularOrders, ...screenshotOrders]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(offsetParam, offsetParam + limitParam);

    // Calculate summary statistics
    const totalOrders = regularOrders.length + screenshotOrders.length;
    const totalSpent = regularOrders.reduce((sum, order) => sum + (order.total || 0), 0) +
      screenshotOrders.reduce((sum, order) => {
        const total = parseFloat(order.orderDetails?.estimatedTotal?.replace(/[^\d.]/g, '') || '0');
        return sum + total;
      }, 0);

    const completedOrders = allOrders.filter(order => 
      ['completed', 'fulfilled', 'delivered'].includes(order.status?.toLowerCase())
    ).length;

    return NextResponse.json({
      success: true,
      orders: allOrders,
      pagination: {
        limit: limitParam,
        offset: offsetParam,
        total: totalOrders,
        hasMore: offsetParam + limitParam < totalOrders
      },
      summary: {
        totalOrders,
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        completedOrders,
        averageOrderValue: totalOrders > 0 ? parseFloat((totalSpent / totalOrders).toFixed(2)) : 0
      }
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}