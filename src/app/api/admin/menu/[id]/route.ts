import { NextRequest, NextResponse } from 'next/server'
import { auth, firestore } from '../../../../../lib/firebaseAdmin'
import { menuItemSchema } from '../../../../../lib/firestoreModels'
import { handleAPIError, apiErrors } from '../../../../../lib/utils/apiErrors'
import { withLogging } from '../../../../../lib/utils/withLogging'
import { AuthUser } from '../../../../../lib/types/firebase'

export const dynamic = "force-dynamic"

async function isAdmin(userId: string) {
  const userSnap = await firestore.collection('users').doc(userId).get()
  const userData = userSnap.data()
  return userSnap.exists && userData ? userData.role === 'admin' : false
}

async function handleGet(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      throw apiErrors.unauthorized()
    }

    const idToken = authHeader.split(' ')[1]
    if (!idToken) {
      throw apiErrors.unauthorized('Invalid authentication token')
    }
    const decodedToken = await auth.verifyIdToken(idToken)
    
    // Validate the decoded token has the required properties
    if (!decodedToken || !decodedToken.uid) {
      throw apiErrors.unauthorized('Invalid authentication token')
    }
    
    // Create a properly typed AuthUser object
    const authUser: AuthUser = decodedToken as AuthUser
    const userId = authUser.uid

    if (!(await isAdmin(userId))) {
      throw apiErrors.forbidden('Only admins can access this resource')
    }

    const docSnap = await firestore.collection('menuItems').doc(params.id).get()
    if (!docSnap.exists) {
      throw apiErrors.notFound('Menu item not found')
    }

    const item = { id: docSnap.id, ...docSnap.data() }
    return NextResponse.json(item)
  } catch (err) {
    return handleAPIError(err)
  }
}

async function handlePatch(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      throw apiErrors.unauthorized()
    }

    const idToken = authHeader.split(' ')[1]
    if (!idToken) {
      throw apiErrors.unauthorized('Invalid authentication token')
    }
    const decodedToken = await auth.verifyIdToken(idToken)
    
    // Validate the decoded token has the required properties
    if (!decodedToken || !decodedToken.uid) {
      throw apiErrors.unauthorized('Invalid authentication token')
    }
    
    // Create a properly typed AuthUser object
    const authUser: AuthUser = decodedToken as AuthUser
    const userId = authUser.uid

    if (!(await isAdmin(userId))) {
      throw apiErrors.forbidden('Only admins can update menu items')
    }

    const docSnap = await firestore.collection('menuItems').doc(params.id).get()
    if (!docSnap.exists) {
      throw apiErrors.notFound('Menu item not found')
    }

    const data = await req.json() as unknown
    const item = menuItemSchema.partial().parse(data)
    
    await firestore.collection('menuItems').doc(params.id).update({
      ...item,
      updatedAt: new Date(),
      updatedBy: userId
    })
    
    const updatedSnap = await firestore.collection('menuItems').doc(params.id).get()
    return NextResponse.json({ id: updatedSnap.id, ...updatedSnap.data() })
  } catch (err) {
    return handleAPIError(err)
  }
}

async function handleDelete(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      throw apiErrors.unauthorized()
    }

    const idToken = authHeader.split(' ')[1]
    if (!idToken) {
      throw apiErrors.unauthorized('Invalid authentication token')
    }
    const decodedToken = await auth.verifyIdToken(idToken)
    
    // Validate the decoded token has the required properties
    if (!decodedToken || !decodedToken.uid) {
      throw apiErrors.unauthorized('Invalid authentication token')
    }
    
    // Create a properly typed AuthUser object
    const authUser: AuthUser = decodedToken as AuthUser
    const userId = authUser.uid

    if (!(await isAdmin(userId))) {
      throw apiErrors.forbidden('Only admins can delete menu items')
    }

    const docSnap = await firestore.collection('menuItems').doc(params.id).get()
    if (!docSnap.exists) {
      throw apiErrors.notFound('Menu item not found')
    }

    await firestore.collection('menuItems').doc(params.id).delete()
    return NextResponse.json({ 
      success: true, 
      id: params.id,
      message: 'Menu item deleted successfully'
    })
  } catch (err) {
    return handleAPIError(err)
  }
}

export const GET = withLogging(handleGet)
export const PATCH = withLogging(handlePatch)
export const DELETE = withLogging(handleDelete)