import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Check if we're in a build environment and skip initialization
const isBuildTime = process.env.NODE_ENV === 'production' && 
  (typeof window === 'undefined') && 
  (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY);

let app: any = null;
let auth: any = null;
let db: any = null;

// Only initialize if not in build time and all required env vars are present
if (!isBuildTime && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    const firebaseAdminConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    };

    app = !getApps().length
      ? initializeApp({
          credential: cert(firebaseAdminConfig),
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        })
      : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.warn('Firebase Admin initialization failed:', error);
  }
}

export { app, auth, db };
