/**
 * Enhanced Firebase SDK Initialization
 * Provides environment-safe configuration for both client and server-side usage
 * with comprehensive error handling and type safety
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, Functions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Firebase configuration interface
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Environment validation
const validateEnvironment = (): FirebaseConfig => {
  const requiredEnvVars = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Check for missing required environment variables
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value || value.includes('your-'))
    .map(([key]) => `NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`);

  if (missingVars.length > 0) {
    const errorMessage = `Missing Firebase environment variables: ${missingVars.join(', ')}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  return {
    ...requiredEnvVars,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  } as FirebaseConfig;
};

// Firebase app instance
let firebaseApp: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let functions: Functions;
let analytics: Analytics | null = null;

// Initialize Firebase with error handling
const initializeFirebase = (): FirebaseApp => {
  try {
    const config = validateEnvironment();
    
    // Initialize app if not already initialized
    if (!getApps().length) {
      firebaseApp = initializeApp(config);
      console.log('✅ Firebase app initialized successfully');
    } else {
      firebaseApp = getApps()[0];
      console.log('✅ Using existing Firebase app instance');
    }

    // Initialize services
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);
    functions = getFunctions(firebaseApp);

    // Initialize Analytics only in browser environment
    if (typeof window !== 'undefined' && config.measurementId) {
      analytics = getAnalytics(firebaseApp);
    }

    // Connect to emulators in development
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      connectToEmulators();
    }

    return firebaseApp;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
};

// Connect to Firebase emulators for local development
const connectToEmulators = () => {
  try {
    // Check if emulators are already connected
    const isEmulatorConnected = (service: any) => {
      return service._delegate?._settings?.host?.includes('localhost') ||
             service._settings?.host?.includes('localhost');
    };

    // Connect Auth emulator
    if (!isEmulatorConnected(auth)) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      console.log('🔧 Connected to Auth emulator');
    }

    // Connect Firestore emulator
    if (!isEmulatorConnected(db)) {
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('🔧 Connected to Firestore emulator');
    }

    // Connect Storage emulator
    if (!isEmulatorConnected(storage)) {
      connectStorageEmulator(storage, 'localhost', 9199);
      console.log('🔧 Connected to Storage emulator');
    }

    // Connect Functions emulator
    if (!isEmulatorConnected(functions)) {
      connectFunctionsEmulator(functions, 'localhost', 5001);
      console.log('🔧 Connected to Functions emulator');
    }
  } catch (error) {
    console.warn('⚠️ Could not connect to emulators:', error);
  }
};

// Initialize Firebase
initializeFirebase();

// Export Firebase services
export { firebaseApp as app, auth, db, storage, functions, analytics };

// Export utility functions
export const getFirebaseConfig = (): FirebaseConfig => validateEnvironment();
export const isEmulatorMode = (): boolean => process.env.NODE_ENV === 'development';

// Health check function
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Simple connectivity test
    await db.enableNetwork();
    return true;
  } catch (error) {
    console.error('Firebase connection check failed:', error);
    return false;
  }
};

export default firebaseApp;