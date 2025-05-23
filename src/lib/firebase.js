"use client";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app = null;
let auth = null;
let db = null;
let storage = null;
let analytics = null;

// Initialize Firebase only on client side
if (typeof window !== "undefined") {
  const initializeFirebase = async () => {
    try {
      const { initializeApp } = await import("firebase/app");
      app = initializeApp(firebaseConfig);

      // Initialize services one by one to handle any potential errors
      try {
        const { getAuth } = await import("firebase/auth");
        auth = getAuth(app);
      } catch (error) {
        console.error("Error initializing auth:", error);
      }

      try {
        const { getFirestore } = await import("firebase/firestore");
        db = getFirestore(app);
      } catch (error) {
        console.error("Error initializing firestore:", error);
      }

      try {
        const { getStorage } = await import("firebase/storage");
        storage = getStorage(app);
      } catch (error) {
        console.error("Error initializing storage:", error);
      }

      try {
        const { getAnalytics } = await import("firebase/analytics");
        analytics = getAnalytics(app);
      } catch (error) {
        console.error("Error initializing analytics:", error);
      }
    } catch (error) {
      console.error("Error initializing Firebase:", error);
    }
  };

  initializeFirebase();
}

export { app, auth, db, storage, analytics };
