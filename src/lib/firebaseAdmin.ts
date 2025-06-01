import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";
import { getStorage, Storage } from "firebase-admin/storage";

// Check if we're in a build environment and skip initialization
const isBuildTime = process.env.NODE_ENV === 'production' && 
  (typeof window === 'undefined') && 
  (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY);

let adminApp: any = null;
let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;
let adminStorage: Storage | null = null;

// Only initialize if not in build time and all required env vars are present
if (!isBuildTime && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    const firebaseAdminConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    };

    adminApp = !getApps().length
      ? initializeApp({
          credential: cert(firebaseAdminConfig),
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        })
      : getApps()[0];
    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
    adminStorage = getStorage(adminApp);
  } catch (error) {
    console.warn('Firebase Admin initialization failed:', error);
  }
}

export { adminApp, adminDb, adminAuth, adminStorage };

// Export aliases for backward compatibility
export const firestore = adminDb;
export const auth = adminAuth;
export const storage = adminStorage;

// Export initialization function for explicit initialization
export function initAdmin() {
  return adminApp;
}
