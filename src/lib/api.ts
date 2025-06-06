import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Stripe } from 'stripe';

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

// Initialize Firebase
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();

// Stripe Client (if needed)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

// API Helper Functions
export const uploadFile = async (file: File, path: string): Promise<string> => {
  const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
};

// Firebase Firestore helpers
export const createService = async (serviceData: any) => {
  const { collection, addDoc } = await import('firebase/firestore');
  const docRef = await addDoc(collection(db, 'services'), serviceData);
  return { id: docRef.id, ...serviceData };
};

export const createOrder = async (orderData: any) => {
  const { collection, addDoc } = await import('firebase/firestore');
  const docRef = await addDoc(collection(db, 'orders'), orderData);
  return { id: docRef.id, ...orderData };
};

export const updateServiceStatus = async (
  serviceId: string,
  status: string,
) => {
  const { doc, updateDoc, getDoc } = await import('firebase/firestore');
  const serviceRef = doc(db, 'services', serviceId);
  await updateDoc(serviceRef, { status });
  const updatedDoc = await getDoc(serviceRef);
  return { id: serviceId, ...updatedDoc.data() };
};

export const getTierMembership = async (userId: string) => {
  const { collection, query, where, getDocs } = await import(
    'firebase/firestore'
  );
  const q = query(
    collection(db, 'tier_memberships'),
    where('userId', '==', userId),
  );
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {return null;}
  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

export const createTierMembership = async (membershipData: any) => {
  const { collection, addDoc } = await import('firebase/firestore');
  const docRef = await addDoc(
    collection(db, 'tier_memberships'),
    membershipData,
  );
  return { id: docRef.id, ...membershipData };
};

export const getVolunteerHours = async (volunteerId: string) => {
  const { collection, query, where, getDocs } = await import(
    'firebase/firestore'
  );
  const q = query(
    collection(db, 'volunteer_hours'),
    where('volunteerId', '==', volunteerId),
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateVolunteerHours = async (
  volunteerId: string,
  hours: number,
) => {
  const { doc, updateDoc, getDoc } = await import('firebase/firestore');
  const volunteerRef = doc(db, 'volunteers', volunteerId);
  await updateDoc(volunteerRef, { hoursServed: hours });
  const updatedDoc = await getDoc(volunteerRef);
  return { id: volunteerId, ...updatedDoc.data() };
};

export const runtime = 'nodejs';
