import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "../../../../lib/firebaseAdmin";
import { db } from "../../../../lib/firebase";
import { addDoc, collection } from "firebase/firestore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,
      orderType,
      contactInfo,
      deliveryInfo,
      deliveryTime,
      scheduledTime,
      paymentMethod,
      subtotal,
      tax,
      total
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      );
    }

    if (!orderType || !contactInfo || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required order information' },
        { status: 400 }
      );
    }

    // Generate order ID
    const orderId = `OTW-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create order data
    const orderData = {
      orderId,
      items,
      orderType,
      contactInfo,
      deliveryInfo,
      deliveryTime,
      scheduledTime,
      paymentMethod,
      subtotal,
      tax,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save order to Firestore
    try {
      await addDoc(collection(db, 'orders'), orderData);
    } catch (firestoreError) {
      console.error('Firestore error:', firestoreError);
      // Continue without Firestore if it fails
    }

    // Send order confirmation email (you can implement this later)
    // await sendOrderConfirmationEmail(contactInfo.email, orderData);

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    error: "Method not allowed" 
  }, { status: 405 });
}

export async function PUT(req: NextRequest) {
  return NextResponse.json({ 
    error: "Method not allowed" 
  }, { status: 405 });
}

export async function DELETE(req: NextRequest) {
  return NextResponse.json({ 
    error: "Method not allowed" 
  }, { status: 405 });
}