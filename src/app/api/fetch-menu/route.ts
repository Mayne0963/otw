import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    error: "This feature is currently being set up. Please check back soon!" 
  }, { status: 503 });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ 
    error: "This feature is currently being set up. Please check back soon!" 
  }, { status: 503 });
}

export async function PUT(req: NextRequest) {
  return NextResponse.json({ 
    error: "This feature is currently being set up. Please check back soon!" 
  }, { status: 503 });
}

export async function DELETE(req: NextRequest) {
  return NextResponse.json({ 
    error: "This feature is currently being set up. Please check back soon!" 
  }, { status: 503 });
}
