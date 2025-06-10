/**
 * Enhanced Firebase Authentication Provider with MCP Integration
 * 
 * This component provides comprehensive authentication functionality integrated
 * with Firebase MCP for automated user management, security, and analytics.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  AuthError
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { firebaseMCP, getFirebaseAuth, getFirebaseDB } from '../../lib/firebase-mcp-integration';

// Types
interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: 'user' | 'admin' | 'moderator';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  emailVerified: boolean;
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
    marketing: boolean;
  };
  stats: {
    totalOrders: number;
    totalSpent: number;
    lastOrderAt: Timestamp | null;
    loginCount: number;
    lastLoginAt: Timestamp | null;
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: Timestamp | null;
    suspiciousActivity: boolean;
  };
}

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth error messages
const getAuthErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/requires-recent-login':
      return 'Please log in again to complete this action.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
};

// Firebase Auth Provider Component
export const FirebaseAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const auth = getFirebaseAuth();
  const db = getFirebaseDB();

  // Initialize authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        
        if (firebaseUser) {
          // Load user profile from Firestore
          await loadUserProfile(firebaseUser.uid);
          
          // Update last login time
          await updateLastLogin(firebaseUser.uid);
        } else {
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [auth, db]);

  // Load user profile from Firestore
  const loadUserProfile = async (uid: string): Promise<void> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Update last login time
  const updateLastLogin = async (uid: string): Promise<void> => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        'stats.lastLoginAt': serverTimestamp(),
        'stats.loginCount': userProfile ? userProfile.stats.loginCount + 1 : 1,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  // Create user profile in Firestore
  const createUserProfile = async (firebaseUser: FirebaseUser, additionalData?: any): Promise<void> => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        const newUserProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: 'user',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          emailVerified: firebaseUser.emailVerified,
          preferences: {
            notifications: true,
            theme: 'system',
            language: 'en',
            marketing: false
          },
          stats: {
            totalOrders: 0,
            totalSpent: 0,
            lastOrderAt: null,
            loginCount: 1,
            lastLoginAt: Timestamp.now()
          },
          security: {
            twoFactorEnabled: false,
            lastPasswordChange: Timestamp.now(),
            suspiciousActivity: false
          },
          ...additionalData
        };

        await setDoc(userRef, newUserProfile);
        setUserProfile(newUserProfile);

        // Log user creation via MCP
        console.log('New user profile created:', firebaseUser.uid);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user profile exists, create if not
      if (result.user) {
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        if (!userDoc.exists()) {
          await createUserProfile(result.user);
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error(getAuthErrorMessage(error as AuthError));
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName?: string): Promise<void> => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName });
      }
      
      // Create user profile
      if (result.user) {
        await createUserProfile(result.user, { displayName });
        
        // Send email verification
        await sendEmailVerification(result.user);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw new Error(getAuthErrorMessage(error as AuthError));
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await createUserProfile(result.user);
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw new Error(getAuthErrorMessage(error as AuthError));
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Facebook
  const signInWithFacebook = async (): Promise<void> => {
    try {
      setLoading(true);
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await createUserProfile(result.user);
      }
    } catch (error) {
      console.error('Facebook sign in error:', error);
      throw new Error(getAuthErrorMessage(error as AuthError));
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Twitter
  const signInWithTwitter = async (): Promise<void> => {
    try {
      setLoading(true);
      const provider = new TwitterAuthProvider();
      
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await createUserProfile(result.user);
      }
    } catch (error) {
      console.error('Twitter sign in error:', error);
      throw new Error(getAuthErrorMessage(error as AuthError));
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error(getAuthErrorMessage(error as AuthError));
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserProfile>): Promise<void> => {
    if (!user || !userProfile) {
      throw new Error('User not authenticated');
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userRef, updateData);
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, ...updateData } : null);
      
      // Update Firebase Auth profile if display name or photo changed
      if (data.displayName !== undefined || data.photoURL !== undefined) {
        await updateProfile(user, {
          displayName: data.displayName || user.displayName,
          photoURL: data.photoURL || user.photoURL
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  // Update password
  const updateUserPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      // Update security info in profile
      await updateDoc(doc(db, 'users', user.uid), {
        'security.lastPasswordChange': serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Password update error:', error);
      throw new Error(getAuthErrorMessage(error as AuthError));
    }
  };

  // Send email verification
  const sendVerificationEmail = async (): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      await sendEmailVerification(user);
    } catch (error) {
      console.error('Email verification error:', error);
      throw new Error(getAuthErrorMessage(error as AuthError));
    }
  };

  // Refresh user profile
  const refreshUserProfile = async (): Promise<void> => {
    if (!user) return;
    
    try {
      await loadUserProfile(user.uid);
    } catch (error) {
      console.error('Profile refresh error:', error);
    }
  };

  // Delete account
  const deleteAccount = async (password: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email!, password);
      await reauthenticateWithCredential(user, credential);
      
      // Delete user profile from Firestore
      // Note: This should be handled by a Cloud Function for data consistency
      
      // Delete Firebase Auth account
      await user.delete();
      
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Account deletion error:', error);
      throw new Error(getAuthErrorMessage(error as AuthError));
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    logout,
    resetPassword,
    updateUserProfile,
    updateUserPassword,
    sendVerificationEmail,
    refreshUserProfile,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useFirebaseAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

// Export types
export type { UserProfile, AuthContextType };
export { getAuthErrorMessage };