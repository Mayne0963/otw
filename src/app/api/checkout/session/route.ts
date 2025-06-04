import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "line_items.data.price.product"],
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Format the response data
    const orderDetails = {
      id: session.id,
      amount_total: session.amount_total,
      customer_details: session.customer_details,
      metadata: session.metadata,
      line_items: {
        data: session.line_items?.data?.map((item) => ({
          description: item.description || 
                      (item.price?.product as Stripe.Product)?.name || 
                      "Unknown Item",
          quantity: item.quantity || 1,
          amount_total: item.amount_total || 0,
        })) || [],
      },
      payment_status: session.payment_status,
      status: session.status,
    };

    return NextResponse.json(orderDetails);
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    return NextResponse.json(
      { error: "Failed to retrieve session details" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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