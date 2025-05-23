import { NextRequest, NextResponse } from "next/server";
import { auth, firestore } from "../../../lib/firebaseAdmin";

interface UserData {
  uid: string;
  name?: string;
  email?: string;
  role?: string;
  rewardPoints?: number;
}

interface RewardData {
  spinsRemaining?: number;
  spinsUsed?: number;
  prizeHistory?: Array<{ prize: string; date: Date }>;
  lastSpinTime?: Date;
}

interface OrderData {
  userRef: string;
  createdAt: Date;
  [key: string]: any;
}

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const idTokenParts = authHeader.split(" ");
    if (idTokenParts.length < 2 || !idTokenParts[1]) {
      return NextResponse.json({ error: "Malformed token" }, { status: 401 });
    }
    const idToken = idTokenParts[1];
    const decoded = await auth.verifyIdToken(idToken);
    const userId = decoded.uid;
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid token: UID missing" },
        { status: 401 },
      );
    }

    // Get user profile
    const userSnap = await firestore.collection("users").doc(userId).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const user = userSnap.data() as UserData;

    if (!user) {
      return NextResponse.json(
        { error: "User data is empty" },
        { status: 404 },
      );
    }

    // Get rewards
    const rewardSnap = await firestore.collection("rewards").doc(userId).get();
    const rewards: RewardData | null = rewardSnap.exists
      ? (rewardSnap.data() as RewardData)
      : null;

    // Get order history
    const ordersSnap = await firestore
      .collection("orders")
      .where("userRef", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();
    const orders: OrderData[] = ordersSnap.docs.map(
      (doc) => doc.data() as OrderData,
    );

    return NextResponse.json({
      user: {
        uid: user.uid,
        name: user.name || null,
        email: user.email || null,
        role: user.role || "user",
        rewardPoints:
          typeof user.rewardPoints === "number" ? user.rewardPoints : 0,
      },
      rewards,
      orders,
    });
  } catch (err: unknown) {
    console.error("Error fetching user profile:", err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const idTokenParts = authHeader.split(" ");
    if (idTokenParts.length < 2 || !idTokenParts[1]) {
      return NextResponse.json({ error: "Malformed token" }, { status: 401 });
    }
    const idToken = idTokenParts[1];
    const decoded = await auth.verifyIdToken(idToken);
    const userId = decoded.uid;
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid token: UID missing" },
        { status: 401 },
      );
    }
    const { name } = await req.json();
    if (!name || typeof name !== "string" || name.length < 2) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    await firestore.collection("users").doc(userId).update({ name });
    return NextResponse.json({ success: true, name });
  } catch (err: unknown) {
    console.error("Error fetching user profile:", err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
