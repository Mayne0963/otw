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

// Function to properly format the private key
function formatPrivateKey(privateKey: string): string {
  if (!privateKey) {
    throw new Error('Private key is required');
  }
  
  // Remove any extra quotes and whitespace
  let formattedKey = privateKey.trim();
  
  // Remove surrounding quotes if present
  if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
    formattedKey = formattedKey.slice(1, -1);
  }
  
  // Replace escaped newlines with actual newlines
  formattedKey = formattedKey.replace(/\\n/g, '\n');
  
  // Ensure the key has proper PEM format
  if (!formattedKey.includes('-----BEGIN PRIVATE KEY-----')) {
    throw new Error('Invalid private key format: Missing PEM header');
  }
  
  if (!formattedKey.includes('-----END PRIVATE KEY-----')) {
    throw new Error('Invalid private key format: Missing PEM footer');
  }
  
  return formattedKey;
}

// Only initialize if not in build time and all required env vars are present
if (!isBuildTime && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);
    
    const firebaseAdminConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    };

    // Validate required fields
    if (!firebaseAdminConfig.projectId) {
      throw new Error('FIREBASE_PROJECT_ID is required');
    }
    if (!firebaseAdminConfig.clientEmail) {
      throw new Error('FIREBASE_CLIENT_EMAIL is required');
    }
    if (!firebaseAdminConfig.privateKey) {
      throw new Error('FIREBASE_PRIVATE_KEY is required');
    }

    app = !getApps().length
      ? initializeApp({
          credential: cert(firebaseAdminConfig),
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        })
      : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
    // Set to null to indicate failure
    app = null;
    auth = null;
    db = null;
  }
} else {
  console.log('Firebase Admin initialization skipped (build time or missing env vars)');
}

export { app, auth, db };
