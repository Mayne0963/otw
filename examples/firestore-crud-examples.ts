/**
 * Firestore CRUD Operations Examples
 * 
 * This file demonstrates how to perform Create, Read, Update, and Delete operations
 * on the Firestore database for the EzyZip application.
 */

import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  Timestamp,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import { db } from '../src/firebase-config';

// Type definitions (should match your schema)
interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: 'user' | 'admin';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark';
    language: string;
  };
  stats: {
    totalOrders: number;
    totalSpent: number;
    lastOrderAt: Timestamp | null;
  };
}

interface Order {
  id?: string;
  userRef: string;
  restaurantId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentIntentId?: string;
  deliveryAddress: Address;
  specialInstructions?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  estimatedDelivery?: Timestamp;
  deliveredAt?: Timestamp;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customizations?: string[];
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface Restaurant {
  id?: string;
  name: string;
  description: string;
  cuisine: string[];
  address: Address;
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  hours: {
    [day: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  menu: MenuItem[];
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  isActive: boolean;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  allergens?: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

// =============================================================================
// USER OPERATIONS
// =============================================================================

/**
 * Create a new user profile
 */
export async function createUser(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const userWithTimestamps = {
      ...userData,
      createdAt: now,
      updatedAt: now
    };
    
    // Use the user's UID as the document ID
    const userRef = doc(db, 'users', userData.uid);
    await setDoc(userRef, userWithTimestamps);
    
    console.log('User created successfully:', userData.uid);
    return userData.uid;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Get a user by ID
 */
export async function getUser(userId: string): Promise<User | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as User;
    } else {
      console.log('No user found with ID:', userId);
      return null;
    }
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(userRef, updateData);
    console.log('User updated successfully:', userId);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Delete a user (soft delete by updating status)
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isActive: false,
      deletedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    console.log('User soft deleted:', userId);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// =============================================================================
// ORDER OPERATIONS
// =============================================================================

/**
 * Create a new order
 */
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const orderWithTimestamps = {
      ...orderData,
      createdAt: now,
      updatedAt: now
    };
    
    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, orderWithTimestamps);
    
    console.log('Order created successfully:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Get an order by ID
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (orderSnap.exists()) {
      return { id: orderSnap.id, ...orderSnap.data() } as Order;
    } else {
      console.log('No order found with ID:', orderId);
      return null;
    }
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
}

/**
 * Get orders for a specific user with pagination
 */
export async function getUserOrders(
  userId: string, 
  limitCount: number = 10, 
  lastOrderId?: string
): Promise<Order[]> {
  try {
    const ordersRef = collection(db, 'orders');
    let q = query(
      ordersRef,
      where('userRef', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    // Add pagination if lastOrderId is provided
    if (lastOrderId) {
      const lastOrderRef = doc(db, 'orders', lastOrderId);
      const lastOrderSnap = await getDoc(lastOrderRef);
      if (lastOrderSnap.exists()) {
        q = query(
          ordersRef,
          where('userRef', '==', userId),
          orderBy('createdAt', 'desc'),
          startAfter(lastOrderSnap),
          limit(limitCount)
        );
      }
    }
    
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    
    return orders;
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string, 
  status: Order['status'], 
  additionalUpdates?: Partial<Order>
): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const updateData = {
      status,
      updatedAt: Timestamp.now(),
      ...additionalUpdates
    };
    
    // Add delivered timestamp if status is delivered
    if (status === 'delivered') {
      updateData.deliveredAt = Timestamp.now();
    }
    
    await updateDoc(orderRef, updateData);
    console.log('Order status updated:', orderId, status);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

/**
 * Get orders by status
 */
export async function getOrdersByStatus(status: Order['status'], limitCount: number = 20): Promise<Order[]> {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('status', '==', status),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    
    return orders;
  } catch (error) {
    console.error('Error getting orders by status:', error);
    throw error;
  }
}

// =============================================================================
// RESTAURANT OPERATIONS
// =============================================================================

/**
 * Create a new restaurant
 */
export async function createRestaurant(restaurantData: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const restaurantWithTimestamps = {
      ...restaurantData,
      createdAt: now,
      updatedAt: now
    };
    
    const restaurantsRef = collection(db, 'restaurants');
    const docRef = await addDoc(restaurantsRef, restaurantWithTimestamps);
    
    console.log('Restaurant created successfully:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating restaurant:', error);
    throw error;
  }
}

/**
 * Get all active restaurants
 */
export async function getActiveRestaurants(): Promise<Restaurant[]> {
  try {
    const restaurantsRef = collection(db, 'restaurants');
    const q = query(
      restaurantsRef,
      where('isActive', '==', true),
      orderBy('rating', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const restaurants: Restaurant[] = [];
    
    querySnapshot.forEach((doc) => {
      restaurants.push({ id: doc.id, ...doc.data() } as Restaurant);
    });
    
    return restaurants;
  } catch (error) {
    console.error('Error getting active restaurants:', error);
    throw error;
  }
}

/**
 * Search restaurants by cuisine
 */
export async function getRestaurantsByCuisine(cuisine: string): Promise<Restaurant[]> {
  try {
    const restaurantsRef = collection(db, 'restaurants');
    const q = query(
      restaurantsRef,
      where('cuisine', 'array-contains', cuisine),
      where('isActive', '==', true),
      orderBy('rating', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const restaurants: Restaurant[] = [];
    
    querySnapshot.forEach((doc) => {
      restaurants.push({ id: doc.id, ...doc.data() } as Restaurant);
    });
    
    return restaurants;
  } catch (error) {
    console.error('Error getting restaurants by cuisine:', error);
    throw error;
  }
}

/**
 * Update restaurant menu
 */
export async function updateRestaurantMenu(restaurantId: string, menu: MenuItem[]): Promise<void> {
  try {
    const restaurantRef = doc(db, 'restaurants', restaurantId);
    await updateDoc(restaurantRef, {
      menu,
      updatedAt: Timestamp.now()
    });
    
    console.log('Restaurant menu updated:', restaurantId);
  } catch (error) {
    console.error('Error updating restaurant menu:', error);
    throw error;
  }
}

// =============================================================================
// BATCH OPERATIONS
// =============================================================================

/**
 * Create multiple orders in a batch
 */
export async function createOrdersBatch(orders: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<string[]> {
  try {
    const batch = writeBatch(db);
    const orderIds: string[] = [];
    const now = Timestamp.now();
    
    orders.forEach((orderData) => {
      const orderRef = doc(collection(db, 'orders'));
      const orderWithTimestamps = {
        ...orderData,
        createdAt: now,
        updatedAt: now
      };
      
      batch.set(orderRef, orderWithTimestamps);
      orderIds.push(orderRef.id);
    });
    
    await batch.commit();
    console.log('Batch orders created:', orderIds.length);
    return orderIds;
  } catch (error) {
    console.error('Error creating batch orders:', error);
    throw error;
  }
}

/**
 * Update multiple order statuses in a batch
 */
export async function updateOrderStatusesBatch(
  orderUpdates: { orderId: string; status: Order['status'] }[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    const now = Timestamp.now();
    
    orderUpdates.forEach(({ orderId, status }) => {
      const orderRef = doc(db, 'orders', orderId);
      const updateData: any = {
        status,
        updatedAt: now
      };
      
      if (status === 'delivered') {
        updateData.deliveredAt = now;
      }
      
      batch.update(orderRef, updateData);
    });
    
    await batch.commit();
    console.log('Batch order statuses updated:', orderUpdates.length);
  } catch (error) {
    console.error('Error updating batch order statuses:', error);
    throw error;
  }
}

// =============================================================================
// TRANSACTION OPERATIONS
// =============================================================================

/**
 * Transfer order between users (example of transaction)
 */
export async function transferOrder(orderId: string, fromUserId: string, toUserId: string): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      // Get the order
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await transaction.get(orderRef);
      
      if (!orderSnap.exists()) {
        throw new Error('Order does not exist');
      }
      
      const orderData = orderSnap.data() as Order;
      
      // Verify current owner
      if (orderData.userRef !== fromUserId) {
        throw new Error('Order does not belong to the specified user');
      }
      
      // Get user stats
      const fromUserRef = doc(db, 'users', fromUserId);
      const toUserRef = doc(db, 'users', toUserId);
      
      const fromUserSnap = await transaction.get(fromUserRef);
      const toUserSnap = await transaction.get(toUserRef);
      
      if (!fromUserSnap.exists() || !toUserSnap.exists()) {
        throw new Error('One or both users do not exist');
      }
      
      const fromUserData = fromUserSnap.data() as User;
      const toUserData = toUserSnap.data() as User;
      
      // Update order ownership
      transaction.update(orderRef, {
        userRef: toUserId,
        updatedAt: Timestamp.now()
      });
      
      // Update user stats
      transaction.update(fromUserRef, {
        'stats.totalOrders': fromUserData.stats.totalOrders - 1,
        'stats.totalSpent': fromUserData.stats.totalSpent - orderData.total,
        updatedAt: Timestamp.now()
      });
      
      transaction.update(toUserRef, {
        'stats.totalOrders': toUserData.stats.totalOrders + 1,
        'stats.totalSpent': toUserData.stats.totalSpent + orderData.total,
        'stats.lastOrderAt': orderData.createdAt,
        updatedAt: Timestamp.now()
      });
    });
    
    console.log('Order transferred successfully:', orderId);
  } catch (error) {
    console.error('Error transferring order:', error);
    throw error;
  }
}

// =============================================================================
// ANALYTICS OPERATIONS
// =============================================================================

/**
 * Track user event for analytics
 */
export async function trackUserEvent(
  userId: string,
  eventType: string,
  eventData: Record<string, any>
): Promise<void> {
  try {
    const analyticsRef = collection(db, 'analytics_events');
    const eventDoc = {
      userId,
      eventType,
      eventData,
      timestamp: Timestamp.now(),
      sessionId: generateSessionId(), // Implement this function
      userAgent: navigator.userAgent
    };
    
    await addDoc(analyticsRef, eventDoc);
    console.log('Analytics event tracked:', eventType);
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    throw error;
  }
}

/**
 * Get user analytics summary
 */
export async function getUserAnalytics(userId: string): Promise<any> {
  try {
    const analyticsRef = doc(db, 'user_analytics', userId);
    const analyticsSnap = await getDoc(analyticsRef);
    
    if (analyticsSnap.exists()) {
      return analyticsSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user analytics:', error);
    throw error;
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate a session ID (implement based on your needs)
 */
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Example usage function
 */
export async function exampleUsage() {
  try {
    // Create a user
    const userId = 'user123';
    await createUser({
      uid: userId,
      email: 'user@example.com',
      displayName: 'John Doe',
      photoURL: null,
      role: 'user',
      preferences: {
        notifications: true,
        theme: 'light',
        language: 'en'
      },
      stats: {
        totalOrders: 0,
        totalSpent: 0,
        lastOrderAt: null
      }
    });
    
    // Create an order
    const orderId = await createOrder({
      userRef: userId,
      restaurantId: 'restaurant123',
      items: [
        {
          id: 'item1',
          name: 'Pizza Margherita',
          price: 1299, // in cents
          quantity: 1
        }
      ],
      total: 1299,
      status: 'pending',
      paymentStatus: 'pending',
      deliveryAddress: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        country: 'US'
      }
    });
    
    // Update order status
    await updateOrderStatus(orderId, 'confirmed');
    
    // Get user orders
    const userOrders = await getUserOrders(userId, 5);
    console.log('User orders:', userOrders);
    
    // Track analytics event
    await trackUserEvent(userId, 'order_placed', {
      orderId,
      restaurantId: 'restaurant123',
      total: 1299
    });
    
  } catch (error) {
    console.error('Example usage error:', error);
  }
}