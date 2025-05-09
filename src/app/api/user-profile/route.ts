import { NextRequest, NextResponse } from 'next/server'
import { auth, firestore } from '../../../lib/firebaseAdmin'

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
    const user = userSnap.data()

    // Get rewards
    const rewardSnap = await firestore.collection('rewards').doc(userId).get()
    const rewards = rewardSnap.exists ? rewardSnap.data() : null

    // Get order history
    const ordersSnap = await firestore.collection('orders')
      .where('userRef', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get()
    const orders = ordersSnap.docs.map(doc => doc.data())

    return NextResponse.json({
      user: {
        uid: user.uid,
        name: user.name,
        email: user.email,
        role: user.role,
        rewardPoints: user.rewardPoints,
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