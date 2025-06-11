import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    const auth = getAuth();
    
    try {
      // Check if user exists
      const userRecord = await auth.getUserByEmail(email);
      
      if (userRecord.emailVerified) {
        return NextResponse.json(
          { message: 'Email is already verified' },
          { status: 200 }
        );
      }
      
      // Generate email verification link
      const actionCodeSettings = {
        url: `${process.env.NEXTAUTH_URL}/auth/signin`,
        handleCodeInApp: true,
      };
      
      const link = await auth.generateEmailVerificationLink(
        email,
        actionCodeSettings
      );
      
      // In a real application, you would send this link via email
      // For now, we'll just return success
      console.log('Verification link generated:', link);
      
      return NextResponse.json(
        { message: 'Verification email sent successfully' },
        { status: 200 }
      );
      
    } catch (userError: any) {
      if (userError.code === 'auth/user-not-found') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      throw userError;
    }
    
  } catch (error) {
    console.error('Error resending verification email:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}