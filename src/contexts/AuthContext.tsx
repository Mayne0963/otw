'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase-config';
import { useRouter } from 'next/navigation';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user was previously signed in to reduce UI flash
    const expectSignIn = localStorage.getItem('expectSignIn') === 'true';
    if (expectSignIn) {
      setLoading(true);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          const userData: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          };
          setUser(userData);
          
          // Store sign-in expectation for future page loads
          localStorage.setItem('expectSignIn', 'true');

          // Create or update user document in Firestore
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
              await setDoc(userDocRef, {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
              });
            } else {
              // Update last login time
              await setDoc(userDocRef, {
                lastLoginAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }, { merge: true });
            }
          } catch (error) {
            console.error('Error creating/updating user document:', error);
          }
        } else {
          setUser(null);
          // Clear sign-in expectation when user signs out
          localStorage.removeItem('expectSignIn');
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
        localStorage.removeItem('expectSignIn');
      } finally {
        setLoading(false);
        setInitializing(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Set expectation before sign in to prevent UI flash
      localStorage.setItem('expectSignIn', 'true');
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Sign in error:', error);
      // Clear expectation on error
      localStorage.removeItem('expectSignIn');
      setLoading(false);
      throw new Error(error.message || 'Failed to sign in');
    }
    // Don't set loading to false here - let onAuthStateChanged handle it
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      // Set expectation before sign up to prevent UI flash
      localStorage.setItem('expectSignIn', 'true');
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

      // Update the user's display name
      await updateProfile(firebaseUser, {
        displayName: displayName,
      });

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Sign up error:', error);
      // Clear expectation on error
      localStorage.removeItem('expectSignIn');
      setLoading(false);
      throw new Error(error.message || 'Failed to create account');
    }
    // Don't set loading to false here - let onAuthStateChanged handle it
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Failed to log out');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Failed to send password reset email');
    }
  };

  const value = {
    user,
    loading,
    initializing,
    signIn,
    signUp,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
