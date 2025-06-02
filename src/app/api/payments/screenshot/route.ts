import { NextRequest, NextResponse } from "next/server";
import { auth, db, storage } from "../../../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, doc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, limit } from "firebase/firestore";
import { verifyIdToken } from "firebase-admin/auth";

export const dynamic = "force-dynamic";

interface PaymentScreenshot {
  id?: string;
  userId: string;
  orderId?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId?: string;
  screenshotUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Verify Firebase Auth token
async function verifyAuthToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No authorization token provided');
  }
  
  const token = authHeader.split('Bearer ')[1];
  
  try {
    const admin = await import('firebase-admin/auth');
    const decodedToken = await admin.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid authorization token');
  }
}

// GET - Retrieve payment screenshots
export async function GET(req: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(req);
    const { searchParams } = new URL(req.url);
    
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');
    const limit_param = searchParams.get('limit');
    const userId = searchParams.get('userId');
    
    // Build query constraints
    const constraints = [];
    
    // Regular users can only see their own screenshots
    // Admin users can see all screenshots
    const userDoc = await getDoc(doc(db, 'users', decodedToken.uid));
    const userData = userDoc.data();
    const isAdmin = userData?.role === 'admin';
    
    if (!isAdmin) {
      constraints.push(where('userId', '==', decodedToken.uid));
    } else if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    if (orderId) {
      constraints.push(where('orderId', '==', orderId));
    }
    
    if (status) {
      constraints.push(where('status', '==', status));
    }
    
    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(parseInt(limit_param || '20')));
    
    const q = query(collection(db, 'payment_screenshots'), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const screenshots: PaymentScreenshot[] = [];
    querySnapshot.forEach((doc) => {
      screenshots.push({
        id: doc.id,
        ...doc.data()
      } as PaymentScreenshot);
    });
    
    return NextResponse.json({
      success: true,
      data: screenshots,
      total: screenshots.length
    });
    
  } catch (error) {
    console.error('Get payment screenshots error:', error);
    
    if (error instanceof Error && error.message.includes('authorization')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to retrieve payment screenshots" },
      { status: 500 }
    );
  }
}

// POST - Upload payment screenshot
export async function POST(req: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(req);
    const formData = await req.formData();
    
    // Extract form data
    const screenshot = formData.get('screenshot') as File;
    const orderId = formData.get('orderId') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const currency = formData.get('currency') as string || 'USD';
    const paymentMethod = formData.get('paymentMethod') as string;
    const transactionId = formData.get('transactionId') as string;
    const notes = formData.get('notes') as string;
    
    // Validation
    if (!screenshot) {
      return NextResponse.json(
        { error: "Screenshot file is required" },
        { status: 400 }
      );
    }
    
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }
    
    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method is required" },
        { status: 400 }
      );
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(screenshot.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed" },
        { status: 400 }
      );
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (screenshot.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 5MB" },
        { status: 400 }
      );
    }
    
    // Upload screenshot to Firebase Storage
    const timestamp = Date.now();
    const fileName = `payment-screenshots/${decodedToken.uid}/${timestamp}-${screenshot.name}`;
    const storageRef = ref(storage, fileName);
    
    const arrayBuffer = await screenshot.arrayBuffer();
    const uploadResult = await uploadBytes(storageRef, arrayBuffer, {
      contentType: screenshot.type
    });
    
    const screenshotUrl = await getDownloadURL(uploadResult.ref);
    
    // Create payment screenshot record
    const paymentScreenshot: Omit<PaymentScreenshot, 'id'> = {
      userId: decodedToken.uid,
      orderId: orderId || undefined,
      amount,
      currency,
      paymentMethod,
      transactionId: transactionId || undefined,
      screenshotUrl,
      status: 'pending',
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, 'payment_screenshots'), paymentScreenshot);
    
    // If orderId is provided, update the order status
    if (orderId) {
      try {
        const orderRef = doc(db, 'orders', orderId);
        const orderDoc = await getDoc(orderRef);
        
        if (orderDoc.exists()) {
          await updateDoc(orderRef, {
            paymentScreenshotId: docRef.id,
            paymentStatus: 'verification_pending',
            updatedAt: new Date().toISOString()
          });
        }
      } catch (orderError) {
        console.error('Error updating order:', orderError);
        // Don't fail the main operation if order update fails
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...paymentScreenshot
      },
      message: "Payment screenshot uploaded successfully"
    });
    
  } catch (error) {
    console.error('Upload payment screenshot error:', error);
    
    if (error instanceof Error && error.message.includes('authorization')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to upload payment screenshot" },
      { status: 500 }
    );
  }
}

// PUT - Update payment screenshot (admin verification)
export async function PUT(req: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(req);
    const { searchParams } = new URL(req.url);
    const screenshotId = searchParams.get('id');
    
    if (!screenshotId) {
      return NextResponse.json(
        { error: "Screenshot ID is required" },
        { status: 400 }
      );
    }
    
    // Check if user is admin
    const userDoc = await getDoc(doc(db, 'users', decodedToken.uid));
    const userData = userDoc.data();
    
    if (userData?.role !== 'admin') {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }
    
    const { status, notes } = await req.json();
    
    // Validate status
    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'pending', 'verified', or 'rejected'" },
        { status: 400 }
      );
    }
    
    const screenshotRef = doc(db, 'payment_screenshots', screenshotId);
    const screenshotDoc = await getDoc(screenshotRef);
    
    if (!screenshotDoc.exists()) {
      return NextResponse.json(
        { error: "Payment screenshot not found" },
        { status: 404 }
      );
    }
    
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString()
    };
    
    if (status === 'verified' || status === 'rejected') {
      updateData.verifiedBy = decodedToken.uid;
      updateData.verifiedAt = new Date().toISOString();
    }
    
    if (notes) {
      updateData.notes = notes;
    }
    
    await updateDoc(screenshotRef, updateData);
    
    // Update related order if exists
    const screenshotData = screenshotDoc.data();
    if (screenshotData?.orderId) {
      try {
        const orderRef = doc(db, 'orders', screenshotData.orderId);
        const orderDoc = await getDoc(orderRef);
        
        if (orderDoc.exists()) {
          let paymentStatus = 'verification_pending';
          
          if (status === 'verified') {
            paymentStatus = 'paid';
          } else if (status === 'rejected') {
            paymentStatus = 'payment_failed';
          }
          
          await updateDoc(orderRef, {
            paymentStatus,
            updatedAt: new Date().toISOString()
          });
        }
      } catch (orderError) {
        console.error('Error updating order:', orderError);
      }
    }
    
    const updatedDoc = await getDoc(screenshotRef);
    
    return NextResponse.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      },
      message: "Payment screenshot updated successfully"
    });
    
  } catch (error) {
    console.error('Update payment screenshot error:', error);
    
    if (error instanceof Error && error.message.includes('authorization')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update payment screenshot" },
      { status: 500 }
    );
  }
}

// DELETE - Delete payment screenshot
export async function DELETE(req: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(req);
    const { searchParams } = new URL(req.url);
    const screenshotId = searchParams.get('id');
    
    if (!screenshotId) {
      return NextResponse.json(
        { error: "Screenshot ID is required" },
        { status: 400 }
      );
    }
    
    const screenshotRef = doc(db, 'payment_screenshots', screenshotId);
    const screenshotDoc = await getDoc(screenshotRef);
    
    if (!screenshotDoc.exists()) {
      return NextResponse.json(
        { error: "Payment screenshot not found" },
        { status: 404 }
      );
    }
    
    const screenshotData = screenshotDoc.data();
    
    // Check permissions - users can only delete their own screenshots, admins can delete any
    const userDoc = await getDoc(doc(db, 'users', decodedToken.uid));
    const userData = userDoc.data();
    const isAdmin = userData?.role === 'admin';
    
    if (!isAdmin && screenshotData?.userId !== decodedToken.uid) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }
    
    // Don't allow deletion of verified screenshots unless admin
    if (screenshotData?.status === 'verified' && !isAdmin) {
      return NextResponse.json(
        { error: "Cannot delete verified payment screenshots" },
        { status: 403 }
      );
    }
    
    await deleteDoc(screenshotRef);
    
    return NextResponse.json({
      success: true,
      message: "Payment screenshot deleted successfully"
    });
    
  } catch (error) {
    console.error('Delete payment screenshot error:', error);
    
    if (error instanceof Error && error.message.includes('authorization')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete payment screenshot" },
      { status: 500 }
    );
  }
}