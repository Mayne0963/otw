import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { adminDb } from "../../../../lib/firebaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const customerName = formData.get("customerName") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const customerEmail = formData.get("customerEmail") as string;
    const restaurantName = formData.get("restaurantName") as string;
    const pickupLocation = formData.get("pickupLocation") as string;
    const estimatedTotal = formData.get("estimatedTotal") as string;
    const specialInstructions = formData.get("specialInstructions") as string;
    const screenshot = formData.get("screenshot") as File;

    // Validate required fields
    if (!customerName || !customerPhone || !customerEmail || !restaurantName || !pickupLocation || !estimatedTotal || !screenshot) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!screenshot.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an image." },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const orderId = `SS-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "screenshots");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save screenshot file
    const bytes = await screenshot.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileExtension = screenshot.name.split('.').pop() || 'jpg';
    const fileName = `${orderId}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);
    
    await writeFile(filePath, buffer);
    const screenshotUrl = `/uploads/screenshots/${fileName}`;

    // Create order data
    const orderData = {
      orderId,
      type: "screenshot",
      status: "pending_review",
      customerInfo: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
      },
      restaurantInfo: {
        name: restaurantName,
        pickupLocation: pickupLocation,
      },
      orderDetails: {
        estimatedTotal: estimatedTotal,
        specialInstructions: specialInstructions || "",
        screenshotUrl: screenshotUrl,
        originalFileName: screenshot.name,
      },
      timestamps: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
      workflow: {
        reviewRequired: true,
        confirmationCalled: false,
        orderPlaced: false,
        pickedUp: false,
        delivered: false,
      },
      metadata: {
        userAgent: request.headers.get("user-agent") || "",
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      },
    };

    // Save to Firestore
    const docRef = await adminDb.collection("screenshot_orders").add(orderData);
    
    // Update order with Firestore document ID
    await adminDb.collection("screenshot_orders").doc(docRef.id).update({
      firestoreId: docRef.id,
    });

    // TODO: Send notification to admin team
    // This could be an email, Slack notification, or push notification
    // For now, we'll log it
    console.log(`New screenshot order received: ${orderId}`);
    console.log(`Customer: ${customerName} (${customerPhone})`);
    console.log(`Restaurant: ${restaurantName}`);
    console.log(`Estimated Total: ${estimatedTotal}`);

    // TODO: Send confirmation email to customer
    // This would typically use a service like SendGrid, Mailgun, etc.
    
    return NextResponse.json({
      success: true,
      orderId: orderId,
      message: "Screenshot order submitted successfully",
    });

  } catch (error) {
    console.error("Error processing screenshot order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle GET requests to retrieve screenshot orders (for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = adminDb.collection("screenshot_orders");

    // Filter by order ID if provided
    if (orderId) {
      const doc = await query.doc(orderId).get();
      if (!doc.exists) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        order: { id: doc.id, ...doc.data() },
      });
    }

    // Filter by status if provided
    if (status) {
      query = query.where("status", "==", status);
    }

    // Order by creation date (newest first) and limit results
    const snapshot = await query
      .orderBy("timestamps.created", "desc")
      .limit(limit)
      .get();

    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      orders,
      count: orders.length,
    });

  } catch (error) {
    console.error("Error retrieving screenshot orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle PUT requests to update order status
export async function PUT(request: NextRequest) {
  try {
    const { orderId, status, notes, adminId } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = [
      "pending_review",
      "confirmed",
      "order_placed",
      "picked_up",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "failed"
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Update order in Firestore
    const updateData: any = {
      status,
      "timestamps.updated": new Date().toISOString(),
    };

    if (notes) {
      updateData.adminNotes = notes;
    }

    if (adminId) {
      updateData.lastUpdatedBy = adminId;
    }

    // Update workflow flags based on status
    switch (status) {
      case "confirmed":
        updateData["workflow.confirmationCalled"] = true;
        break;
      case "order_placed":
        updateData["workflow.orderPlaced"] = true;
        break;
      case "picked_up":
        updateData["workflow.pickedUp"] = true;
        break;
      case "delivered":
        updateData["workflow.delivered"] = true;
        break;
    }

    await adminDb.collection("screenshot_orders").doc(orderId).update(updateData);

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
    });

  } catch (error) {
    console.error("Error updating screenshot order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}