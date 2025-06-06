import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '../../../lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

// Helper function to verify authentication
async function verifyAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized - No valid token provided');
  }

  const token = authHeader.split('Bearer ')[1];
  const decodedToken = await adminAuth.verifyIdToken(token);
  return decodedToken;
}

export async function GET(req: NextRequest) {
  try {
    const decodedToken = await verifyAuth(req);
    const userId = decodedToken.uid;

    // Get user profile from Firestore
    const userDoc = await adminDb.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      // Create default profile if it doesn't exist
      const defaultProfile = {
        uid: userId,
        email: decodedToken.email || '',
        name: decodedToken.name || '',
        phone: '',
        address: '',
        preferences: {
          notifications: true,
          marketing: false,
          darkMode: false,
        },
        loyaltyPoints: 0,
        membershipTier: 'bronze',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await adminDb.collection('users').doc(userId).set(defaultProfile);
      return NextResponse.json({ success: true, data: defaultProfile });
    }

    const userData = userDoc.data();
    return NextResponse.json({ success: true, data: userData });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user profile' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const decodedToken = await verifyAuth(req);
    const userId = decodedToken.uid;
    const body = await req.json();

    const profileData = {
      ...body,
      uid: userId,
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection('users').doc(userId).set(profileData, { merge: true });

    return NextResponse.json({ success: true, data: profileData });
  } catch (error) {
    console.error('Error creating user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user profile' },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const decodedToken = await verifyAuth(req);
    const userId = decodedToken.uid;
    const body = await req.json();

    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection('users').doc(userId).update(updateData);

    // Get updated document
    const updatedDoc = await adminDb.collection('users').doc(userId).get();
    const updatedData = updatedDoc.data();

    return NextResponse.json({ success: true, data: updatedData });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user profile' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const decodedToken = await verifyAuth(req);
    const userId = decodedToken.uid;

    await adminDb.collection('users').doc(userId).delete();

    return NextResponse.json({ success: true, message: 'User profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user profile' },
      { status: 500 },
    );
  }
}
