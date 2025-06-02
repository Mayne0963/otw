import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { doc, getDoc, updateDoc, setDoc, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase-admin/auth";

interface SpinReward {
  type: 'points' | 'discount' | 'free_delivery' | 'free_item' | 'cashback' | 'nothing';
  value: number;
  label: string;
  description?: string;
  expiresAt?: string;
}

const SPIN_REWARDS: SpinReward[] = [
  { type: "points", value: 100, label: "100 Points", description: "Added to your account" },
  { type: "points", value: 250, label: "250 Points", description: "Added to your account" },
  { type: "points", value: 500, label: "500 Points", description: "Added to your account" },
  { type: "discount", value: 10, label: "10% Off", description: "Next order discount" },
  { type: "discount", value: 15, label: "15% Off", description: "Next order discount" },
  { type: "discount", value: 20, label: "20% Off", description: "Next order discount" },
  { type: "free_delivery", value: 1, label: "Free Delivery", description: "Next order" },
  { type: "free_item", value: 1, label: "Free Side", description: "Any side item" },
  { type: "cashback", value: 5, label: "$5 Cashback", description: "Added to wallet" },
  { type: "nothing", value: 0, label: "Better Luck Next Time", description: "Try again tomorrow" },
];

// Weighted probabilities for different rewards
const REWARD_WEIGHTS = {
  points: 0.4,      // 40% chance
  discount: 0.25,   // 25% chance
  free_delivery: 0.15, // 15% chance
  free_item: 0.1,   // 10% chance
  cashback: 0.05,   // 5% chance
  nothing: 0.05     // 5% chance
};

function getWeightedRandomReward(): SpinReward {
  const random = Math.random();
  let cumulativeWeight = 0;
  
  for (const [type, weight] of Object.entries(REWARD_WEIGHTS)) {
    cumulativeWeight += weight;
    if (random <= cumulativeWeight) {
      const rewardsOfType = SPIN_REWARDS.filter(r => r.type === type);
      return rewardsOfType[Math.floor(Math.random() * rewardsOfType.length)];
    }
  }
  
  // Fallback
  return SPIN_REWARDS[SPIN_REWARDS.length - 1]; // "Better Luck Next Time"
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the Firebase token
    let decodedToken;
    try {
      const { getAuth } = await import('firebase-admin/auth');
      decodedToken = await getAuth().verifyIdToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;
    const { spinType } = await request.json();

    if (!spinType) {
      return NextResponse.json(
        { error: "Missing spin type" },
        { status: 400 }
      );
    }

    // Check user's spin availability
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const today = new Date().toDateString();
    const lastSpinDate = userData.lastSpinDate;
    const dailySpinsUsed = userData.dailySpinsUsed || 0;
    const maxDailySpins = userData.membershipTier === 'gold' ? 3 : userData.membershipTier === 'silver' ? 2 : 1;

    // Check if user can spin today
    if (lastSpinDate === today && dailySpinsUsed >= maxDailySpins) {
      return NextResponse.json(
        { error: "Daily spin limit reached. Try again tomorrow!" },
        { status: 429 }
      );
    }

    // Get random reward
    const reward = getWeightedRandomReward();
    const spinId = `spin_${userId}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    // Update user's spin count
    const newSpinsUsed = lastSpinDate === today ? dailySpinsUsed + 1 : 1;
    await updateDoc(userRef, {
      lastSpinDate: today,
      dailySpinsUsed: newSpinsUsed
    });

    // Apply reward based on type
    if (reward.type === 'points') {
      const currentPoints = userData.loyaltyPoints || 0;
      await updateDoc(userRef, {
        loyaltyPoints: currentPoints + reward.value
      });
    } else if (reward.type === 'cashback') {
      const currentWallet = userData.walletBalance || 0;
      await updateDoc(userRef, {
        walletBalance: currentWallet + reward.value
      });
    }

    // Record the spin and reward
    const spinRecord = {
      userId,
      spinId,
      spinType,
      reward: {
        ...reward,
        expiresAt: reward.type !== 'points' && reward.type !== 'cashback' ? expiresAt : null
      },
      timestamp: new Date().toISOString(),
      redeemed: reward.type === 'points' || reward.type === 'cashback', // Auto-redeem points and cashback
      redeemedAt: reward.type === 'points' || reward.type === 'cashback' ? new Date().toISOString() : null
    };

    await addDoc(collection(db, 'spin_history'), spinRecord);

    // If it's a coupon/discount, save it to user's rewards
    if (reward.type === 'discount' || reward.type === 'free_delivery' || reward.type === 'free_item') {
      await addDoc(collection(db, 'user_rewards'), {
        userId,
        rewardType: reward.type,
        rewardValue: reward.value,
        rewardLabel: reward.label,
        rewardDescription: reward.description,
        expiresAt,
        isUsed: false,
        createdAt: new Date().toISOString(),
        source: 'daily_spin'
      });
    }

    return NextResponse.json({
      success: true,
      reward: {
        ...reward,
        expiresAt: reward.type !== 'points' && reward.type !== 'cashback' ? expiresAt : null
      },
      message: `You won: ${reward.label}!`,
      spinsRemaining: maxDailySpins - newSpinsUsed
    });
    
  } catch (error) {
    console.error("Spin redemption error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
