import { NextResponse } from "next/server";
// import { verifyIDWithAI } from "../../../lib/services/openai";
// import { storeVerificationStatus } from "../../../lib/services/firebase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { idImage, selfieImage, userId } = await request.json();

    if (!idImage || !selfieImage || !userId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Temporarily disabled ID verification
    const verificationResult = {
      success: false,
      message: "ID verification is currently being set up. Please check back soon."
    };

    return NextResponse.json(verificationResult);
  } catch (error) {
    console.error("Error in ID verification API:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during verification" },
      { status: 500 },
    );
  }
}
