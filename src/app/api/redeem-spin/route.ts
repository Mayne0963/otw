import { NextRequest, NextResponse } from 'next/server'
import { auth, firestore } from '../../../lib/firebaseAdmin'

interface Prize {
  name: string;
  type: string;
}

interface RewardData {
  spinsRemaining?: number;
  spinsUsed?: number;
  prizeHistory?: Array<{prize: string; date: Date}>;
  lastSpinTime?: Date;
}

// Simple in-memory rate limit (for demo only)
const rateLimit: Record<string, number> = {}
const COOLDOWN_MS = 1000 * 60 * 60 * 6 // 6 hours

const PRIZES: Prize[] = [
  { name: 'Free Infused Side', type: 'food' },
  { name: '10% Off Next Order', type: 'discount' },
  { name: 'VIP Badge', type: 'badge' },
  { name: 'No Prize, Try Again!', type: 'none' },
  { name: 'Free Broskis Drink', type: 'food' },
]

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const idTokenParts = authHeader.split(' ')
    if (idTokenParts.length < 2 || !idTokenParts[1]) {
      return NextResponse.json({ error: 'Malformed token' }, { status: 401 })
    }
    const idToken = idTokenParts[1];
    const decoded = await auth.verifyIdToken(idToken)
    const userId = decoded.uid
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token: UID missing' }, { status: 401 })
    }

    // Rate limit (in-memory, per instance)
    const now = Date.now()
    if (rateLimit[userId] && now - rateLimit[userId] < COOLDOWN_MS) {
      const wait = Math.ceil((COOLDOWN_MS - (now - rateLimit[userId])) / 1000)
      return NextResponse.json({ error: 'Cooldown', wait }, { status: 429 })
    }

    // Get rewards doc
    const rewardRef = firestore.collection('rewards').doc(userId)
    const rewardSnap = await rewardRef.get()
    const rewardData: RewardData | undefined = rewardSnap.exists ? rewardSnap.data() as RewardData : undefined

    if (!rewardData || typeof rewardData.spinsRemaining !== 'number' || rewardData.spinsRemaining < 1) {
      return NextResponse.json({ error: 'No spins remaining' }, { status: 403 })
    }

    // Assign prize
    const prize = PRIZES[Math.floor(Math.random() * PRIZES.length)]
    const prizeHistory = rewardData.prizeHistory || []
    const spinsUsed = (rewardData.spinsUsed || 0) + 1
    const spinsRemaining = rewardData.spinsRemaining - 1
    const lastSpinTime = new Date()

    await rewardRef.set({
      spinsUsed,
      spinsRemaining,
      lastSpinTime,
      prizeHistory: [
        ...prizeHistory,
        { prize: prize.name, date: lastSpinTime },
      ],
    }, { merge: true })

    // Set rate limit
    rateLimit[userId] = now

    return NextResponse.json({
      prize,
      spinsRemaining,
      spinsUsed,
      lastSpinTime,
      cooldown: COOLDOWN_MS / 1000,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
