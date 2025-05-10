import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../lib/firebaseAdmin'
import { createDeliveryRequest, estimateDelivery, getDeliveryStatus } from '../../../lib/services/delivery'
import { withLogging } from '../../../lib/utils/withLogging'

export const dynamic = "force-dynamic"

// GET /api/delivery/:id - Get delivery status
export const GET = withLogging(async (req: NextRequest) => {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const idToken = authHeader.split(' ')[1]
    const decoded = await auth.verifyIdToken(idToken)
    const userId = decoded.uid

    const url = new URL(req.url)
    const deliveryId = url.searchParams.get('id')
    if (!deliveryId) {
      return NextResponse.json({ error: 'Delivery ID required' }, { status: 400 })
    }

    const delivery = await getDeliveryStatus(deliveryId)
    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 })
    }
    if (delivery.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(delivery)
  } catch (err: any) {
    console.error('Error fetching delivery:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
})

// POST /api/delivery/estimate - Get delivery estimate
export const POST = withLogging(async (req: NextRequest) => {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const idToken = authHeader.split(' ')[1]
    const decoded = await auth.verifyIdToken(idToken)
    const userId = decoded.uid

    const body = await req.json()
    const { type } = body

    if (type === 'estimate') {
      const { pickupAddress, dropoffAddress, priority } = body
      if (!pickupAddress || !dropoffAddress || !priority) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      const estimate = await estimateDelivery(pickupAddress, dropoffAddress, priority)
      return NextResponse.json(estimate)
    }

    if (type === 'create') {
      const request = await createDeliveryRequest(userId, body.request)
      return NextResponse.json(request)
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
  } catch (err: any) {
    console.error('Error processing delivery request:', err)
    if (err.name === 'ZodError') {
      return NextResponse.json({
        error: 'Validation error',
        details: err.errors
      }, { status: 400 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
})
