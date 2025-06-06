import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';

export const dynamic = 'force-dynamic';

interface MenuItem {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  ingredients?: string[];
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  preparationTime?: number;
  spicyLevel?: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Verify admin access
async function verifyAdminAccess(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authentication required');
  }

  const token = authHeader.split(' ')[1];

  try {
    const { getAuth } = await import('firebase-admin/auth');
    const decodedToken = await getAuth().verifyIdToken(token);

    // Check if user has admin role
    const userRef = doc(db, 'users', decodedToken.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    if (userData.role !== 'admin' && userData.role !== 'super_admin') {
      throw new Error('Admin access required');
    }

    return decodedToken.uid;
  } catch (error) {
    throw new Error('Invalid authentication token');
  }
}

// GET - Retrieve all menu items
export async function GET(req: NextRequest) {
  try {
    await verifyAdminAccess(req);

    const menuCollection = collection(db, 'menu_items');
    const q = query(menuCollection, orderBy('category'), orderBy('name'));
    const querySnapshot = await getDocs(q);

    const menuItems: MenuItem[] = [];
    querySnapshot.forEach((doc) => {
      menuItems.push({
        id: doc.id,
        ...doc.data(),
      } as MenuItem);
    });

    return NextResponse.json({
      success: true,
      data: menuItems,
      count: menuItems.length,
    });

  } catch (error) {
    console.error('Admin menu GET error:', error);

    if (error instanceof Error) {
      if (error.message.includes('Authentication') || error.message.includes('Admin access')) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 },
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// POST - Create new menu item
export async function POST(req: NextRequest) {
  try {
    await verifyAdminAccess(req);

    const menuItem: MenuItem = await req.json();

    // Validate required fields
    if (!menuItem.name || !menuItem.description || !menuItem.price || !menuItem.category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, price, category' },
        { status: 400 },
      );
    }

    // Add timestamps
    const now = new Date().toISOString();
    const newMenuItem = {
      ...menuItem,
      available: menuItem.available ?? true,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, 'menu_items'), newMenuItem);

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...newMenuItem,
      },
      message: 'Menu item created successfully',
    });

  } catch (error) {
    console.error('Admin menu POST error:', error);

    if (error instanceof Error) {
      if (error.message.includes('Authentication') || error.message.includes('Admin access')) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 },
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// PUT - Update existing menu item
export async function PUT(req: NextRequest) {
  try {
    await verifyAdminAccess(req);

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json(
        { error: 'Menu item ID required' },
        { status: 400 },
      );
    }

    const updates: Partial<MenuItem> = await req.json();

    // Check if item exists
    const itemRef = doc(db, 'menu_items', itemId);
    const itemDoc = await getDoc(itemRef);

    if (!itemDoc.exists()) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 },
      );
    }

    // Add update timestamp
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(itemRef, updatedData);

    // Get updated document
    const updatedDoc = await getDoc(itemRef);

    return NextResponse.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
      message: 'Menu item updated successfully',
    });

  } catch (error) {
    console.error('Admin menu PUT error:', error);

    if (error instanceof Error) {
      if (error.message.includes('Authentication') || error.message.includes('Admin access')) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 },
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// DELETE - Remove menu item
export async function DELETE(req: NextRequest) {
  try {
    await verifyAdminAccess(req);

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json(
        { error: 'Menu item ID required' },
        { status: 400 },
      );
    }

    // Check if item exists
    const itemRef = doc(db, 'menu_items', itemId);
    const itemDoc = await getDoc(itemRef);

    if (!itemDoc.exists()) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 },
      );
    }

    await deleteDoc(itemRef);

    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully',
    });

  } catch (error) {
    console.error('Admin menu DELETE error:', error);

    if (error.message.includes('Authentication') || error.message.includes('Admin access')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
