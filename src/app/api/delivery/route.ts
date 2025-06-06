import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';

export const dynamic = 'force-dynamic';

interface DeliveryRequest {
  orderId: string;
  pickupAddress: string;
  deliveryAddress: string;
  customerPhone: string;
  specialInstructions?: string;
  deliveryType: 'food' | 'package' | 'grocery';
  priority: 'standard' | 'express' | 'urgent';
  estimatedValue?: number;
}

interface DeliveryUpdate {
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  driverId?: string;
  location?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
  notes?: string;
  estimatedArrival?: string;
}

// Verify authentication
async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authentication required');
  }

  const token = authHeader.split(' ')[1];

  try {
    const { getAuth } = await import('firebase-admin/auth');
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    throw new Error('Invalid authentication token');
  }
}

// GET - Retrieve delivery information
export async function GET(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    const { searchParams } = new URL(req.url);
    const deliveryId = searchParams.get('id');
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');
    const driverId = searchParams.get('driverId');

    if (deliveryId) {
      // Get specific delivery
      const deliveryRef = doc(db, 'deliveries', deliveryId);
      const deliveryDoc = await getDoc(deliveryRef);

      if (!deliveryDoc.exists()) {
        return NextResponse.json(
          { error: 'Delivery not found' },
          { status: 404 },
        );
      }

      const deliveryData = deliveryDoc.data();

      // Check if user has access to this delivery
      if (deliveryData.customerId !== userId && deliveryData.driverId !== userId) {
        // Check if user is admin
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        if (!userData || (userData.role !== 'admin' && userData.role !== 'driver')) {
          return NextResponse.json(
            { error: 'Access denied' },
            { status: 403 },
          );
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          id: deliveryDoc.id,
          ...deliveryData,
        },
      });
    }

    // Get multiple deliveries with filters
    const q = collection(db, 'deliveries');
    const constraints = [];

    if (orderId) {
      constraints.push(where('orderId', '==', orderId));
    }

    if (status) {
      constraints.push(where('status', '==', status));
    }

    if (driverId) {
      constraints.push(where('driverId', '==', driverId));
    } else {
      // If not filtering by driver, show user's deliveries
      constraints.push(where('customerId', '==', userId));
    }

    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(50));

    const deliveryQuery = query(q, ...constraints);
    const querySnapshot = await getDocs(deliveryQuery);

    const deliveries: any[] = [];
    querySnapshot.forEach((doc) => {
      deliveries.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return NextResponse.json({
      success: true,
      data: deliveries,
      count: deliveries.length,
    });

  } catch (error) {
    console.error('Delivery GET error:', error);

    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// POST - Create new delivery request
export async function POST(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    const deliveryRequest: DeliveryRequest = await req.json();

    // Validate required fields
    if (!deliveryRequest.orderId || !deliveryRequest.pickupAddress ||
        !deliveryRequest.deliveryAddress || !deliveryRequest.customerPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Calculate estimated delivery time based on priority
    const now = new Date();
    const estimatedDelivery = new Date(now);

    switch (deliveryRequest.priority) {
      case 'urgent':
        estimatedDelivery.setMinutes(now.getMinutes() + 30);
        break;
      case 'express':
        estimatedDelivery.setMinutes(now.getMinutes() + 60);
        break;
      default:
        estimatedDelivery.setMinutes(now.getMinutes() + 90);
    }

    const newDelivery = {
      ...deliveryRequest,
      customerId: userId,
      status: 'pending',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      estimatedDelivery: estimatedDelivery.toISOString(),
      trackingHistory: [{
        status: 'pending',
        timestamp: now.toISOString(),
        notes: 'Delivery request created',
      }],
    };

    const docRef = await addDoc(collection(db, 'deliveries'), newDelivery);

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...newDelivery,
      },
      message: 'Delivery request created successfully',
    });

  } catch (error) {
    console.error('Delivery POST error:', error);

    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// PUT - Update delivery status
export async function PUT(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    const { searchParams } = new URL(req.url);
    const deliveryId = searchParams.get('id');

    if (!deliveryId) {
      return NextResponse.json(
        { error: 'Delivery ID required' },
        { status: 400 },
      );
    }

    const update: DeliveryUpdate = await req.json();

    // Check if delivery exists
    const deliveryRef = doc(db, 'deliveries', deliveryId);
    const deliveryDoc = await getDoc(deliveryRef);

    if (!deliveryDoc.exists()) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 },
      );
    }

    const deliveryData = deliveryDoc.data();

    // Check permissions - only driver assigned to delivery or admin can update
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    const isDriver = deliveryData.driverId === userId;
    const isAdmin = userData?.role === 'admin' || userData?.role === 'super_admin';

    if (!isDriver && !isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 },
      );
    }

    // Update delivery
    const now = new Date().toISOString();
    const trackingHistory = deliveryData.trackingHistory || [];

    // Add new tracking entry
    trackingHistory.push({
      status: update.status,
      timestamp: now,
      notes: update.notes || '',
      location: update.location,
      updatedBy: userId,
    });

    const updatedData = {
      status: update.status,
      updatedAt: now,
      trackingHistory,
      ...(update.driverId && { driverId: update.driverId }),
      ...(update.estimatedArrival && { estimatedArrival: update.estimatedArrival }),
      ...(update.location && { currentLocation: update.location }),
    };

    await updateDoc(deliveryRef, updatedData);

    // Get updated document
    const updatedDoc = await getDoc(deliveryRef);

    return NextResponse.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
      message: 'Delivery updated successfully',
    });

  } catch (error) {
    console.error('Delivery PUT error:', error);

    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// DELETE - Cancel delivery (soft delete)
export async function DELETE(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    const { searchParams } = new URL(req.url);
    const deliveryId = searchParams.get('id');

    if (!deliveryId) {
      return NextResponse.json(
        { error: 'Delivery ID required' },
        { status: 400 },
      );
    }

    // Check if delivery exists
    const deliveryRef = doc(db, 'deliveries', deliveryId);
    const deliveryDoc = await getDoc(deliveryRef);

    if (!deliveryDoc.exists()) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 },
      );
    }

    const deliveryData = deliveryDoc.data();

    // Check permissions - only customer or admin can cancel
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    const isCustomer = deliveryData.customerId === userId;
    const isAdmin = userData?.role === 'admin' || userData?.role === 'super_admin';

    if (!isCustomer && !isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 },
      );
    }

    // Check if delivery can be cancelled
    if (deliveryData.status === 'delivered' || deliveryData.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot cancel completed or already cancelled delivery' },
        { status: 400 },
      );
    }

    // Update status to cancelled
    const now = new Date().toISOString();
    const trackingHistory = deliveryData.trackingHistory || [];

    trackingHistory.push({
      status: 'cancelled',
      timestamp: now,
      notes: 'Delivery cancelled by user',
      updatedBy: userId,
    });

    await updateDoc(deliveryRef, {
      status: 'cancelled',
      updatedAt: now,
      trackingHistory,
      cancelledAt: now,
      cancelledBy: userId,
    });

    return NextResponse.json({
      success: true,
      message: 'Delivery cancelled successfully',
    });

  } catch (error) {
    console.error('Delivery DELETE error:', error);

    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
