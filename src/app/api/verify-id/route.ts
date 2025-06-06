import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '../../../lib/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';

interface VerificationRequest {
  idType: 'drivers_license' | 'passport' | 'state_id';
  idNumber: string;
  fullName: string;
  dateOfBirth: string;
  address: string;
  frontImageUrl?: string;
  backImageUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
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
        { error: 'Invalid authentication token' },
        { status: 401 },
      );
    }

    const userId = decodedToken.uid;
    const data: VerificationRequest = await request.json();

    // Validate required fields
    if (!data.idType || !data.idNumber || !data.fullName || !data.dateOfBirth || !data.address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Create verification record
    const verificationData = {
      userId,
      idType: data.idType,
      idNumber: data.idNumber,
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      address: data.address,
      frontImageUrl: data.frontImageUrl || null,
      backImageUrl: data.backImageUrl || null,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      verifiedAt: null,
      verifiedBy: null,
      notes: null,
    };

    // Save to Firestore
    const verificationRef = doc(db, 'id_verifications', userId);
    await setDoc(verificationRef, verificationData);

    // Update user profile to indicate verification is pending
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      idVerificationStatus: 'pending',
      idVerificationSubmittedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      message: 'ID verification submitted successfully',
      status: 'pending',
      submittedAt: verificationData.submittedAt,
    });

  } catch (error) {
    console.error('ID verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
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
        { error: 'Invalid authentication token' },
        { status: 401 },
      );
    }

    const userId = decodedToken.uid;

    // Get verification status from Firestore
    const verificationRef = doc(db, 'id_verifications', userId);
    const verificationDoc = await getDoc(verificationRef);

    if (!verificationDoc.exists()) {
      return NextResponse.json({
        status: 'not_submitted',
        message: 'No ID verification found',
      });
    }

    const verificationData = verificationDoc.data();

    // Return verification status (excluding sensitive data)
    return NextResponse.json({
      status: verificationData.status,
      submittedAt: verificationData.submittedAt,
      verifiedAt: verificationData.verifiedAt,
      idType: verificationData.idType,
      notes: verificationData.notes,
    });

  } catch (error) {
    console.error('ID verification status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
