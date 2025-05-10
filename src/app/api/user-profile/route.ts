import { NextRequest, NextResponse } from 'next/server'
import { auth, firestore } from '../../../lib/firebaseAdmin'

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
  prizeHistory?: Array<{prize: string; date: Date}>;
  lastSpinTime?: Date;
}

interface OrderData {
  userRef: string;
  createdAt: Date;
  [key: string]: any;
}

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const idToken = authHeader.split(' ')[1]
    const decoded = await auth.verifyIdToken(idToken)
    const userId = decoded.uid

    // Get user profile
    const userSnap = await firestore.collection('users').doc(userId).get()
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const user = userSnap.data() as UserData

    if (!user) {
      return NextResponse.json({ error: 'User data is empty' }, { status: 404 })
    }

    // Get rewards
    const rewardSnap = await firestore.collection('rewards').doc(userId).get()
    const rewards: RewardData | null = rewardSnap.exists ? rewardSnap.data() as RewardData : null

    // Get order history
    const ordersSnap = await firestore.collection('orders')
      .where('userRef', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get()
    const orders: OrderData[] = ordersSnap.docs.map(doc => doc.data() as OrderData)

    return NextResponse.json({
      user: {
        uid: user.uid,
        name: user.name || null,
        email: user.email || null,
        role: user.role || 'user',
        rewardPoints: typeof user.rewardPoints === 'number' ? user.rewardPoints : 0,
      },
      rewards,
      orders,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const idToken = authHeader.split(' ')[1]
    const decoded = await auth.verifyIdToken(idToken)
    const userId = decoded.uid
    const { name } = await req.json()
    if (!name || typeof name !== 'string' || name.length < 2) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
    }
    await firestore.collection('users').doc(userId).update({ name })
    return NextResponse.json({ success: true, name })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
