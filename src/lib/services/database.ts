import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit
} from 'firebase/firestore';
import { db } from '../firebase';

// Types for our data models
export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  logo: string;
  categories: string[];
  rating: number;
  reviewCount: number;
  priceLevel: string;
  deliveryFee: number;
  deliveryTime: string;
  address: string;
  distance: number;
  isPartner: boolean;
  featured: boolean;
  tags: string[];
  dietaryOptions: string[];
  features: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular: boolean;
  dietary: {
    dairyFree: boolean;
    glutenFree: boolean;
    vegetarian: boolean;
    vegan: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: {
    id: string;
    name: string;
  };
  category: string;
  image: string;
  price: number;
  capacity: number;
  registered: number;
  featured: boolean;
  features: string[];
  schedule: Array<{
    time: string;
    activity: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Volunteer {
  id: string;
  title: string;
  icon: string;
  description: string;
  commitment: string;
  skills: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  points: number;
  image: string;
  category: string;
  available: boolean;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  features: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  featured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

class DatabaseService {
  // Restaurant methods
  async getRestaurants(filters?: {
    category?: string;
    featured?: boolean;
    isPartner?: boolean;
    limit?: number;
  }): Promise<Restaurant[]> {
    try {
      let q = collection(db, 'restaurants');
      
      if (filters?.category && filters.category !== 'all') {
        q = query(q, where('categories', 'array-contains', filters.category));
      }
      
      if (filters?.featured !== undefined) {
        q = query(q, where('featured', '==', filters.featured));
      }
      
      if (filters?.isPartner !== undefined) {
        q = query(q, where('isPartner', '==', filters.isPartner));
      }
      
      if (filters?.limit) {
        q = query(q, limit(filters.limit));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Restaurant));
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      return [];
    }
  }

  async getRestaurant(id: string): Promise<Restaurant | null> {
    try {
      const docRef = doc(db, 'restaurants', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Restaurant;
      }
      return null;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      return null;
    }
  }

  async createRestaurant(restaurant: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, 'restaurants'), {
        ...restaurant,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating restaurant:', error);
      return null;
    }
  }

  async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<boolean> {
    try {
      const docRef = doc(db, 'restaurants', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating restaurant:', error);
      return false;
    }
  }

  async deleteRestaurant(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'restaurants', id));
      return true;
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      return false;
    }
  }

  // Menu methods
  async getMenuItems(restaurantId?: string, category?: string): Promise<MenuItem[]> {
    try {
      let q = collection(db, 'menuItems');
      
      if (restaurantId) {
        q = query(q, where('restaurantId', '==', restaurantId));
      }
      
      if (category) {
        q = query(q, where('category', '==', category));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return [];
    }
  }

  async getMenuItem(id: string): Promise<MenuItem | null> {
    try {
      const docRef = doc(db, 'menuItems', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as MenuItem;
      }
      return null;
    } catch (error) {
      console.error('Error fetching menu item:', error);
      return null;
    }
  }

  async createMenuItem(menuItem: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, 'menuItems'), {
        ...menuItem,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating menu item:', error);
      return null;
    }
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<boolean> {
    try {
      const docRef = doc(db, 'menuItems', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating menu item:', error);
      return false;
    }
  }

  async deleteMenuItem(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'menuItems', id));
      return true;
    } catch (error) {
      console.error('Error deleting menu item:', error);
      return false;
    }
  }

  // Event methods
  async getEvents(filters?: {
    category?: string;
    featured?: boolean;
    upcoming?: boolean;
    limit?: number;
  }): Promise<Event[]> {
    try {
      let q = collection(db, 'events');
      
      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }
      
      if (filters?.featured !== undefined) {
        q = query(q, where('featured', '==', filters.featured));
      }
      
      if (filters?.upcoming) {
        const today = new Date().toISOString().split('T')[0];
        q = query(q, where('date', '>=', today));
      }
      
      q = query(q, orderBy('date', 'asc'));
      
      if (filters?.limit) {
        q = query(q, limit(filters.limit));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  async getEvent(id: string): Promise<Event | null> {
    try {
      const docRef = doc(db, 'events', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Event;
      }
      return null;
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  }

  async createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, 'events'), {
        ...event,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating event:', error);
      return null;
    }
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<boolean> {
    try {
      const docRef = doc(db, 'events', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      return false;
    }
  }

  async deleteEvent(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'events', id));
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }

  // Volunteer methods
  async getVolunteers(): Promise<Volunteer[]> {
    try {
      const snapshot = await getDocs(collection(db, 'volunteers'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Volunteer));
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      return [];
    }
  }

  async getVolunteer(id: string): Promise<Volunteer | null> {
    try {
      const docRef = doc(db, 'volunteers', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Volunteer;
      }
      return null;
    } catch (error) {
      console.error('Error fetching volunteer:', error);
      return null;
    }
  }

  async createVolunteer(volunteer: Omit<Volunteer, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, 'volunteers'), {
        ...volunteer,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating volunteer:', error);
      return null;
    }
  }

  async updateVolunteer(id: string, updates: Partial<Volunteer>): Promise<boolean> {
    try {
      const docRef = doc(db, 'volunteers', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating volunteer:', error);
      return false;
    }
  }

  async deleteVolunteer(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'volunteers', id));
      return true;
    } catch (error) {
      console.error('Error deleting volunteer:', error);
      return false;
    }
  }

  // Reward methods
  async getRewards(filters?: {
    category?: string;
    available?: boolean;
    limit?: number;
  }): Promise<Reward[]> {
    try {
      let q = collection(db, 'rewards');
      
      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }
      
      if (filters?.available !== undefined) {
        q = query(q, where('available', '==', filters.available));
      }
      
      q = query(q, orderBy('points', 'asc'));
      
      if (filters?.limit) {
        q = query(q, limit(filters.limit));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reward));
    } catch (error) {
      console.error('Error fetching rewards:', error);
      return [];
    }
  }

  async getReward(id: string): Promise<Reward | null> {
    try {
      const docRef = doc(db, 'rewards', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Reward;
      }
      return null;
    } catch (error) {
      console.error('Error fetching reward:', error);
      return null;
    }
  }

  async createReward(reward: Omit<Reward, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, 'rewards'), {
        ...reward,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating reward:', error);
      return null;
    }
  }

  async updateReward(id: string, updates: Partial<Reward>): Promise<boolean> {
    try {
      const docRef = doc(db, 'rewards', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating reward:', error);
      return false;
    }
  }

  async deleteReward(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'rewards', id));
      return true;
    } catch (error) {
      console.error('Error deleting reward:', error);
      return false;
    }
  }

  // Location methods
  async getLocations(filters?: {
    city?: string;
    state?: string;
    featured?: boolean;
    limit?: number;
  }): Promise<Location[]> {
    try {
      let q = collection(db, 'locations');
      
      if (filters?.city) {
        q = query(q, where('city', '==', filters.city));
      }
      
      if (filters?.state) {
        q = query(q, where('state', '==', filters.state));
      }
      
      if (filters?.featured !== undefined) {
        q = query(q, where('featured', '==', filters.featured));
      }
      
      q = query(q, orderBy('name', 'asc'));
      
      if (filters?.limit) {
        q = query(q, limit(filters.limit));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Location));
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  }

  async getLocation(id: string): Promise<Location | null> {
    try {
      const docRef = doc(db, 'locations', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Location;
      }
      return null;
    } catch (error) {
      console.error('Error fetching location:', error);
      return null;
    }
  }

  async createLocation(location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, 'locations'), {
        ...location,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating location:', error);
      return null;
    }
  }

  async updateLocation(id: string, updates: Partial<Location>): Promise<boolean> {
    try {
      const docRef = doc(db, 'locations', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating location:', error);
      return false;
    }
  }

  async deleteLocation(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'locations', id));
      return true;
    } catch (error) {
      console.error('Error deleting location:', error);
      return false;
    }
  }
}

export const databaseService = new DatabaseService();
export default databaseService;