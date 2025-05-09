import { NextRequest, NextResponse } from 'next/server'
import { auth, firestore } from '../../../../lib/firebaseAdmin'
import { menuItemSchema } from '../../../../lib/firestoreModels'

async function isAdmin(userId: string) {
  const userSnap = await firestore.collection('users').doc(userId).get()
  return userSnap.exists && userSnap.data()?.role === 'admin'
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
    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query parameters
    const url = new URL(req.url)
    const type = url.searchParams.get('type')
    const source = url.searchParams.get('source')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const page = parseInt(url.searchParams.get('page') || '1')
    const sortBy = url.searchParams.get('sortBy') || 'name'
    const sortOrder = url.searchParams.get('sortOrder') || 'asc'

    // Build query
    let query = firestore.collection('menuItems')
    if (type) query = query.where('type', '==', type)
    if (source) query = query.where('source', '==', source)
    
    // Apply sorting
    query = query.orderBy(sortBy, sortOrder as 'asc' | 'desc')
    
    // Apply pagination
    const startAt = (page - 1) * limit
    query = query.limit(limit).offset(startAt)

    // Execute query
    const menuSnap = await query.get()
    const menu = menuSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Get total count for pagination
    const totalSnap = await firestore.collection('menuItems').count().get()
    const total = totalSnap.data().count

    return NextResponse.json({
      menu,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (err: any) {
    console.error('Error fetching menu items:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const idToken = authHeader.split(' ')[1]
    const decoded = await auth.verifyIdToken(idToken)
    const userId = decoded.uid
    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await req.json()
    
    try {
      const item = menuItemSchema.parse(data)
      const docRef = await firestore.collection('menuItems').add({
        ...item,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId
      })
      
      // Return the created item with its ID
      const newDoc = await docRef.get()
      return NextResponse.json({ id: newDoc.id, ...newDoc.data() })
    } catch (validationError: any) {
      console.error('Validation error:', validationError)
      return NextResponse.json({
        error: 'Invalid menu item data',
        details: validationError.errors
      }, { status: 400 })
    }
  } catch (err: any) {
    console.error('Error creating menu item:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}