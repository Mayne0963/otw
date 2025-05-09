import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getStorage, Storage } from 'firebase-admin/storage'

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

// Initialize Firebase Admin
const app = !getApps().length
  ? initializeApp({
      credential: cert(firebaseAdminConfig),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    })
  : getApps()[0]

// Export initialized services
export const adminDb: Firestore = getFirestore(app)
export const adminAuth: Auth = getAuth(app)
export const adminStorage: Storage = getStorage(app)

// Export aliases for backward compatibility
export const firestore = adminDb
export const auth = adminAuth
export const storage = adminStorage

// Export initialization function for explicit initialization
export function initAdmin() {
  return app
} 