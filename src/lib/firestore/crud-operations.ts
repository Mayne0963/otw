/**
 * Comprehensive Firestore CRUD Operations
 * Provides type-safe database operations for all collections
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentSnapshot,
  QuerySnapshot,
  WriteBatch,
  writeBatch,
  runTransaction,
  Transaction
} from 'firebase/firestore';
import { db } from '../firebase-enhanced';

// Types based on Firestore schema
export interface User {
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

export interface Order {
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

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customizations?: string[];
}

export interface Address {
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

export interface ScreenshotOrder {
  id?: string;
  customerInfo: {
    uid: string;
    name: string;
    email: string;
    phone?: string;
  };
  screenshotUrl: string;
  extractedItems: ExtractedItem[];
  estimatedTotal: number;
  status: 'processing' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  deliveryAddress: Address;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  processedAt?: Timestamp;
}

export interface ExtractedItem {
  name: string;
  quantity: number;
  estimatedPrice: number;
  confidence: number;
}

export interface Restaurant {
  id?: string;
  name: string;
  description: string;
  cuisine: string[];
  address: Address;
  phone: string;
  email: string;
  website?: string;
  hours: {
    [key: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  };
  rating: number;
  reviewCount: number;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  features: string[];
  imageUrls: string[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Generic CRUD Operations
export class FirestoreService<T extends { id?: string }> {
  constructor(private collectionName: string) {}

  // Create
  async create(data: Omit<T, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Read by ID
  async getById(id: string): Promise<T | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting ${this.collectionName} by ID:`, error);
      throw error;
    }
  }

  // Read all with optional filtering
  async getAll(filters?: { field: string; operator: any; value: any }[], orderByField?: string, limitCount?: number): Promise<T[]> {
    try {
      let q = collection(db, this.collectionName);
      let queryRef: any = q;

      // Apply filters
      if (filters) {
        filters.forEach(filter => {
          queryRef = query(queryRef, where(filter.field, filter.operator, filter.value));
        });
      }

      // Apply ordering
      if (orderByField) {
        queryRef = query(queryRef, orderBy(orderByField, 'desc'));
      }

      // Apply limit
      if (limitCount) {
        queryRef = query(queryRef, limit(limitCount));
      }

      const querySnapshot = await getDocs(queryRef);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
      console.error(`Error getting all ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Update
  async update(id: string, data: Partial<Omit<T, 'id'>>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Delete
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Paginated query
  async getPaginated(
    pageSize: number,
    lastDoc?: DocumentSnapshot,
    filters?: { field: string; operator: any; value: any }[],
    orderByField: string = 'createdAt'
  ): Promise<{ data: T[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> {
    try {
      let queryRef: any = collection(db, this.collectionName);

      // Apply filters
      if (filters) {
        filters.forEach(filter => {
          queryRef = query(queryRef, where(filter.field, filter.operator, filter.value));
        });
      }

      // Apply ordering
      queryRef = query(queryRef, orderBy(orderByField, 'desc'));

      // Apply pagination
      if (lastDoc) {
        queryRef = query(queryRef, startAfter(lastDoc));
      }

      queryRef = query(queryRef, limit(pageSize + 1)); // Get one extra to check if there are more

      const querySnapshot = await getDocs(queryRef);
      const docs = querySnapshot.docs;
      const hasMore = docs.length > pageSize;
      
      const data = docs.slice(0, pageSize).map(doc => ({ id: doc.id, ...doc.data() } as T));
      const newLastDoc = hasMore ? docs[pageSize - 1] : null;

      return { data, lastDoc: newLastDoc, hasMore };
    } catch (error) {
      console.error(`Error getting paginated ${this.collectionName}:`, error);
      throw error;
    }
  }
}

// Specialized Services
export class UserService extends FirestoreService<User> {
  constructor() {
    super('users');
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getAll([{ field: 'email', operator: '==', value: email }]);
    return users.length > 0 ? users[0] : null;
  }

  async updateUserStats(userId: string, orderTotal: number): Promise<void> {
    const userRef = doc(db, 'users', userId);
    
    await runTransaction(db, async (transaction: Transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        const newStats = {
          totalOrders: userData.stats.totalOrders + 1,
          totalSpent: userData.stats.totalSpent + orderTotal,
          lastOrderAt: Timestamp.now()
        };
        
        transaction.update(userRef, {
          stats: newStats,
          updatedAt: Timestamp.now()
        });
      }
    });
  }
}

export class OrderService extends FirestoreService<Order> {
  constructor() {
    super('orders');
  }

  async getUserOrders(userId: string, limitCount: number = 10): Promise<Order[]> {
    return this.getAll(
      [{ field: 'userRef', operator: '==', value: userId }],
      'createdAt',
      limitCount
    );
  }

  async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
    return this.getAll([{ field: 'status', operator: '==', value: status }]);
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const updateData: Partial<Order> = { status };
    
    if (status === 'delivered') {
      updateData.deliveredAt = Timestamp.now();
    }
    
    await this.update(orderId, updateData);
  }

  async createOrderWithUserUpdate(orderData: Omit<Order, 'id'>, userId: string): Promise<string> {
    const batch = writeBatch(db);
    
    // Create order
    const orderRef = doc(collection(db, 'orders'));
    batch.set(orderRef, {
      ...orderData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    // Update user stats
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      batch.update(userRef, {
        'stats.totalOrders': userData.stats.totalOrders + 1,
        'stats.totalSpent': userData.stats.totalSpent + orderData.total,
        'stats.lastOrderAt': Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
    
    await batch.commit();
    return orderRef.id;
  }
}

export class ScreenshotOrderService extends FirestoreService<ScreenshotOrder> {
  constructor() {
    super('screenshot_orders');
  }

  async getUserScreenshotOrders(userId: string): Promise<ScreenshotOrder[]> {
    return this.getAll([{ field: 'customerInfo.uid', operator: '==', value: userId }]);
  }

  async getOrdersToProcess(): Promise<ScreenshotOrder[]> {
    return this.getAll([{ field: 'status', operator: '==', value: 'processing' }]);
  }

  async markAsProcessed(orderId: string, extractedItems: ExtractedItem[], estimatedTotal: number): Promise<void> {
    await this.update(orderId, {
      extractedItems,
      estimatedTotal,
      status: 'confirmed',
      processedAt: Timestamp.now()
    });
  }
}

export class RestaurantService extends FirestoreService<Restaurant> {
  constructor() {
    super('restaurants');
  }

  async getActiveRestaurants(): Promise<Restaurant[]> {
    return this.getAll([{ field: 'isActive', operator: '==', value: true }]);
  }

  async getRestaurantsByCuisine(cuisine: string): Promise<Restaurant[]> {
    return this.getAll([{ field: 'cuisine', operator: 'array-contains', value: cuisine }]);
  }

  async searchRestaurants(searchTerm: string): Promise<Restaurant[]> {
    // Note: This is a simple implementation. For production, consider using Algolia or similar
    const restaurants = await this.getActiveRestaurants();
    return restaurants.filter(restaurant => 
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  async updateRating(restaurantId: string, newRating: number): Promise<void> {
    const restaurant = await this.getById(restaurantId);
    if (restaurant) {
      const totalRating = restaurant.rating * restaurant.reviewCount;
      const newReviewCount = restaurant.reviewCount + 1;
      const updatedRating = (totalRating + newRating) / newReviewCount;
      
      await this.update(restaurantId, {
        rating: Math.round(updatedRating * 10) / 10, // Round to 1 decimal place
        reviewCount: newReviewCount
      });
    }
  }
}

// Export service instances
export const userService = new UserService();
export const orderService = new OrderService();
export const screenshotOrderService = new ScreenshotOrderService();
export const restaurantService = new RestaurantService();

// Utility functions
export const createTimestamp = () => Timestamp.now();
export const timestampToDate = (timestamp: Timestamp) => timestamp.toDate();
export const dateToTimestamp = (date: Date) => Timestamp.fromDate(date);

// Batch operations
export const batchWrite = async (operations: Array<{ type: 'create' | 'update' | 'delete'; collection: string; id?: string; data?: any }>) => {
  const batch = writeBatch(db);
  
  operations.forEach(operation => {
    const docRef = operation.id ? doc(db, operation.collection, operation.id) : doc(collection(db, operation.collection));
    
    switch (operation.type) {
      case 'create':
        batch.set(docRef, { ...operation.data, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
        break;
      case 'update':
        batch.update(docRef, { ...operation.data, updatedAt: Timestamp.now() });
        break;
      case 'delete':
        batch.delete(docRef);
        break;
    }
  });
  
  await batch.commit();
};