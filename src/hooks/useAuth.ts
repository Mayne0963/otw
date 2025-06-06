'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '../types';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateEmail as updateFirebaseEmail,
  updatePassword as updateFirebasePassword,
  deleteUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  type UserCredential,
  updateProfile as updateFirebaseProfile,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
} from 'firebase/auth';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, storage } from '../lib/api';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

// Custom error types
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// Image validation and compression
const validateImage = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(img.src);

      // Check dimensions
      if (img.width < 100 || img.height < 100) {
        reject(
          new AuthError(
            'Image dimensions must be at least 100x100 pixels',
            'storage/invalid-dimensions',
          ),
        );
      }

      // Check aspect ratio (between 0.5 and 2)
      const aspectRatio = img.width / img.height;
      if (aspectRatio < 0.5 || aspectRatio > 2) {
        reject(
          new AuthError(
            'Image aspect ratio must be between 0.5 and 2',
            'storage/invalid-aspect-ratio',
          ),
        );
      }

      resolve();
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new AuthError('Failed to load image', 'storage/invalid-image'));
    };
  });
};

const compressImage = async (
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  } = {},
): Promise<File> => {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8,
    format = 'jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(img.src);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(
          new AuthError(
            'Failed to create canvas context',
            'storage/compression-error',
          ),
        );
        return;
      }

      // Calculate new dimensions
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new AuthError(
                'Failed to compress image',
                'storage/compression-error',
              ),
            );
            return;
          }
          resolve(new File([blob], file.name, { type: `image/${format}` }));
        },
        `image/${format}`,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new AuthError('Failed to load image', 'storage/invalid-image'));
    };
  });
};

const cropImage = async (
  file: File,
  crop: {
    x: number;
    y: number;
    width: number;
    height: number;
  },
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(img.src);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(
          new AuthError(
            'Failed to create canvas context',
            'storage/crop-error',
          ),
        );
        return;
      }

      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx.drawImage(
        img,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height,
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new AuthError('Failed to crop image', 'storage/crop-error'));
            return;
          }
          resolve(new File([blob], file.name, { type: file.type }));
        },
        file.type,
        1,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new AuthError('Failed to load image', 'storage/invalid-image'));
    };
  });
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else {
            // Create user document if it doesn't exist
            const newUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            setUser({
            ...newUser,
            name: firebaseUser.displayName || '',
            role: 'user' as const,
          } as User);
          }
        } else {
          setUser(null);
        }
      } catch (err: unknown) {
        setError(handleFirebaseError(err));
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        setUser(userDoc.data() as User);
      } else {
        // Create user document if it doesn't exist
        const newUser: User = {
          id: userCredential.user.uid,
          name: userCredential.user.displayName || '',
          email: userCredential.user.email || '',
          role: 'user' as const,
        };
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          ...newUser,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setUser(newUser);
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      const authError = handleFirebaseError(err);
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    userData: Partial<User>,
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (userCredential.user) {
        const newUser = {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          ...userData,
          membershipTier: 'none',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
        setUser(newUser as User);
      }
    } catch (err: unknown) {
      const authError = handleFirebaseError(err);
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await firebaseSignOut(auth);
      setUser(null);
      router.push('/');
    } catch (err: unknown) {
      const authError = handleFirebaseError(err);
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    try {
      setLoading(true);
      if (!user) {throw new Error('No user logged in');}

      await updateDoc(doc(db, 'users', user.id), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      setUser((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err: unknown) {
      const errorMessage =
        (err as Error)?.message || 'Failed to update profile';
      setError(new AuthError(errorMessage, 'UPDATE_PROFILE_ERROR', err));
    } finally {
      setLoading(false);
    }
  };

  // Update user preferences
  const updatePreferences = async (
    preferences: User['preferences'],
  ): Promise<void> => {
    try {
      setLoading(true);
      if (!user) {throw new Error('No user logged in');}

      // Update preferences in Firestore
      await updateDoc(doc(db, 'users', user.id), {
        preferences,
        updatedAt: new Date().toISOString(),
      });

      // Update local state
      setUser((prev) => (prev ? { ...prev, preferences } : null));
    } catch (err: unknown) {
      const errorMessage =
        (err as Error)?.message || 'Failed to update preferences';
      setError(new AuthError(errorMessage, 'UPDATE_PREFERENCES_ERROR', err));
    } finally {
      setLoading(false);
    }
  };

  // Update notification settings
  const updateNotificationSettings = async (
    settings: User['notificationSettings'],
  ): Promise<void> => {
    try {
      setLoading(true);
      if (!user) {throw new Error('No user logged in');}

      // Update notification settings in Firestore
      await updateDoc(doc(db, 'users', user.id), {
        notificationSettings: settings,
        updatedAt: new Date().toISOString(),
      });

      // Update local state
      setUser((prev) =>
        prev ? { ...prev, notificationSettings: settings } : null,
      );
    } catch (err: unknown) {
      const errorMessage =
        (err as Error)?.message || 'Failed to update notification settings';
      setError(
        new AuthError(errorMessage, 'UPDATE_NOTIFICATION_SETTINGS_ERROR', err),
      );
    } finally {
      setLoading(false);
    }
  };

  // Add activity to history
  const addActivity = async (
    activity: NonNullable<User['activityHistory']>[0],
  ): Promise<void> => {
    try {
      setLoading(true);
      if (!user) {throw new Error('No user logged in');}

      // Update activity history in Firestore
      await updateDoc(doc(db, 'users', user.id), {
        activityHistory: [...(user.activityHistory || []), activity],
        updatedAt: new Date().toISOString(),
      });

      // Update local state
      setUser((prev) =>
        prev
          ? {
              ...prev,
              activityHistory: [...(prev.activityHistory || []), activity],
            }
          : null,
      );
    } catch (err: unknown) {
      const errorMessage = (err as Error)?.message || 'Failed to add activity';
      setError(new AuthError(errorMessage, 'ADD_ACTIVITY_ERROR', err));
    } finally {
      setLoading(false);
    }
  };

  // Save an item
  const saveItem = async (item: NonNullable<User['savedItems']>[0]): Promise<void> => {
    try {
      setLoading(true);
      if (!user) {throw new Error('No user logged in');}

      // Update saved items in Firestore
      await updateDoc(doc(db, 'users', user.id), {
        savedItems: [...(user.savedItems || []), item],
        updatedAt: new Date().toISOString(),
      });

      // Update local state
      setUser((prev) =>
        prev
          ? {
              ...prev,
              savedItems: [...(prev.savedItems || []), item],
            }
          : null,
      );
    } catch (err: unknown) {
      const errorMessage = (err as Error)?.message || 'Failed to save item';
      setError(new AuthError(errorMessage, 'SAVE_ITEM_ERROR', err));
    } finally {
      setLoading(false);
    }
  };

  // Remove a saved item
  const removeSavedItem = async (itemId: string): Promise<void> => {
    try {
      setLoading(true);
      if (!user) {throw new Error('No user logged in');}

      // Update saved items in Firestore
      await updateDoc(doc(db, 'users', user.id), {
        savedItems: user.savedItems?.filter((item) => item.itemId !== itemId),
        updatedAt: new Date().toISOString(),
      });

      // Update local state
      setUser((prev) =>
        prev
          ? {
              ...prev,
              savedItems: prev.savedItems?.filter(
                (item) => item.itemId !== itemId,
              ),
            }
          : null,
      );
    } catch (err: unknown) {
      const errorMessage =
        (err as Error)?.message || 'Failed to remove saved item';
      setError(new AuthError(errorMessage, 'REMOVE_SAVED_ITEM_ERROR', err));
    } finally {
      setLoading(false);
    }
  };

  // Helper function to handle social login
  const handleSocialLogin = async (
    provider: GoogleAuthProvider | FacebookAuthProvider | OAuthProvider,
  ): Promise<UserCredential> => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, provider);

      if (result.user) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));

        if (!userDoc.exists()) {
          // Create user document if it doesn't exist
          const newUser = {
            id: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName || '',
            photoURL: result.user.photoURL,
            membershipTier: 'none',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await setDoc(doc(db, 'users', result.user.uid), newUser);
          setUser({
            ...newUser,
            name: result.user.displayName || '',
            role: 'user' as const,
          } as User);
        } else {
          setUser(userDoc.data() as User);
        }
      }

      return result;
    } catch (err: unknown) {
      const authError = handleFirebaseError(err);
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to handle Firebase errors
  const handleFirebaseError = (err: unknown): AuthError => {
    const errorCode =
      typeof err === 'object' && err !== null && 'code' in err
        ? (err as { code: string }).code
        : 'unknown';
    let errorMessage = 'An error occurred during authentication';

    switch (errorCode) {
      case 'auth/user-not-found':
        errorMessage = 'No user found with this email';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password';
        break;
      case 'auth/email-already-in-use':
        errorMessage = 'Email is already registered';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/account-exists-with-different-credential':
        errorMessage =
          'An account already exists with the same email address but different sign-in credentials';
        break;
      case 'auth/popup-closed-by-user':
        errorMessage = 'Sign-in popup was closed before completing the sign-in';
        break;
      case 'auth/cancelled-popup-request':
        errorMessage = 'Sign-in popup was cancelled';
        break;
      case 'auth/popup-blocked':
        errorMessage = 'Sign-in popup was blocked by the browser';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error occurred';
        break;
      case 'auth/requires-recent-login':
        errorMessage = 'Please sign in again to perform this action';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many attempts. Please try again later';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'This operation is not allowed';
        break;
      case 'auth/invalid-verification-code':
        errorMessage = 'Invalid verification code';
        break;
      case 'auth/invalid-verification-id':
        errorMessage = 'Invalid verification ID';
        break;
      case 'auth/missing-verification-code':
        errorMessage = 'Missing verification code';
        break;
      case 'auth/missing-verification-id':
        errorMessage = 'Missing verification ID';
        break;
      case 'storage/object-not-found':
        errorMessage = 'File not found';
        break;
      case 'storage/unauthorized':
        errorMessage = 'Unauthorized to access this file';
        break;
      case 'storage/canceled':
        errorMessage = 'Upload canceled';
        break;
      case 'storage/unknown':
        errorMessage = 'Unknown storage error';
        break;
      case 'storage/invalid-dimensions':
        errorMessage = 'Image dimensions must be at least 100x100 pixels';
        break;
      case 'storage/invalid-aspect-ratio':
        errorMessage = 'Image aspect ratio must be between 0.5 and 2';
        break;
      case 'storage/invalid-image':
        errorMessage = 'Invalid image file';
        break;
      case 'storage/compression-error':
        errorMessage = 'Failed to compress image';
        break;
      case 'storage/crop-error':
        errorMessage = 'Failed to crop image';
        break;
      case 'storage/filter-error':
        errorMessage = 'Failed to apply image filter';
        break;
      case 'storage/invalid-crop-dimensions':
        errorMessage = 'Invalid crop dimensions';
        break;
      case 'storage/invalid-filter':
        errorMessage = 'Invalid image filter';
        break;
      default:
        errorMessage =
          typeof err === 'object' && err !== null && 'message' in err
            ? String(err.message)
            : 'An unknown error occurred';
    }

    return new AuthError(errorMessage, errorCode, err);
  };

  // Enhanced Profile Picture Upload
  const uploadProfilePicture = async (
    file: File,
    options: {
      crop?: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    } = {},
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      if (!auth.currentUser) {
        throw new AuthError('User not authenticated', 'auth/user-not-found');
      }

      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        throw new AuthError(
          'File must be an image',
          'storage/invalid-file-type',
        );
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        throw new AuthError(
          'File size must be less than 5MB',
          'storage/file-too-large',
        );
      }

      // Validate image dimensions and aspect ratio
      await validateImage(file);

      // Process image
      let processedFile = file;

      if (options.crop) {
        processedFile = await cropImage(file, options.crop);
      }

      processedFile = await compressImage(processedFile, {
        maxWidth: options.maxWidth,
        maxHeight: options.maxHeight,
        quality: options.quality,
        format: options.format,
      });

      // Delete old profile picture if exists
      if (user?.profileImage) {
        try {
          const oldImageRef = ref(storage, user.profileImage);
          await deleteObject(oldImageRef);
        } catch (err: unknown) {
          // Ignore error if file doesn't exist
          console.warn('Error deleting old profile picture:', err);
        }
      }

      // Upload new profile picture
      const fileExtension = processedFile.name.split('.').pop();
      const fileName = `profile-pictures/${auth.currentUser.uid}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, processedFile);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firebase profile
      await updateFirebaseProfile(auth.currentUser, {
        photoURL: downloadURL,
      });

      // Update Supabase user data
      const { error: userError } = await supabase
        .from('users')
        .update({
          profileImage: downloadURL,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', auth.currentUser.uid);

      if (userError) {throw userError;}

      // Update local state
      setUser((prev) => (prev ? { ...prev, profileImage: downloadURL } : null));

      return downloadURL;
    } catch (err: unknown) {
      const authError = handleFirebaseError(err);
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  // Delete Profile Picture
  const deleteProfilePicture = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (!auth.currentUser) {
        throw new AuthError('User not authenticated', 'auth/user-not-found');
      }

      if (!user?.profileImage) {
        throw new AuthError(
          'No profile picture to delete',
          'storage/object-not-found',
        );
      }

      // Delete from Firebase Storage
      const imageRef = ref(storage, user.profileImage);
      await deleteObject(imageRef);

      // Update Firebase profile
      await updateFirebaseProfile(auth.currentUser, {
        photoURL: null,
      });

      // Update Supabase user data
      const { error: userError } = await supabase
        .from('users')
        .update({
          profileImage: null,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', auth.currentUser.uid);

      if (userError) {throw userError;}

      // Update local state
      setUser((prev) => (prev ? { ...prev, profileImage: undefined } : null));
    } catch (err: unknown) {
      const authError = handleFirebaseError(err);
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  // Update activity history
  const updateActivityHistory = async (activity: {
    type: string;
    description: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (!auth.currentUser) {
        throw new AuthError('User not authenticated', 'auth/user-not-found');
      }

      // Add activity to Supabase
      const { error: activityError } = await supabase
        .from('user_activities')
        .insert([
          {
            userId: auth.currentUser.uid,
            type: activity.type,
            description: activity.description,
            metadata: activity.metadata,
            createdAt: new Date().toISOString(),
          },
        ]);

      if (activityError) {throw activityError;}

      // Update local state
      setUser((prev) =>
        prev
          ? {
              ...prev,
              activityHistory: [
                ...(prev.activityHistory || []),
                {
                  ...activity,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : null,
      );
    } catch (err: unknown) {
      const authError = handleFirebaseError(err);
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const updateSavedItems = async (item: {
    type: string;
    itemId: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (!auth.currentUser) {
        throw new AuthError('User not authenticated', 'auth/user-not-found');
      }

      // Add saved item to Supabase
      const { error: savedItemError } = await supabase
        .from('saved_items')
        .insert([
          {
            userId: auth.currentUser.uid,
            type: item.type,
            itemId: item.itemId,
            metadata: item.metadata,
            createdAt: new Date().toISOString(),
          },
        ]);

      if (savedItemError) {throw savedItemError;}

      // Update local state
      setUser((prev) =>
        prev
          ? {
              ...prev,
              savedItems: [
                ...(prev.savedItems || []),
                {
                  ...item,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : null,
      );
    } catch (err: unknown) {
      const authError = handleFirebaseError(err);
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  // Social Login Methods
  const signInWithGoogle = async (): Promise<UserCredential> => {
    const result = await handleSocialLogin(new GoogleAuthProvider());
    router.push('/dashboard');
    return result;
  };

  const signInWithFacebook = async (): Promise<UserCredential> => {
    const result = await handleSocialLogin(new FacebookAuthProvider());
    router.push('/dashboard');
    return result;
  };

  const signInWithApple = async (): Promise<UserCredential> => {
    const result = await handleSocialLogin(new OAuthProvider('apple.com'));
    router.push('/dashboard');
    return result;
  };

  // Email/Password Methods
  const signOutEmail = async (
    email: string,
    password: string,
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      await signOut();
    } catch (err: unknown) {
      const authError = handleFirebaseError(err);
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err: unknown) {
      const authError = handleFirebaseError(err);
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const updateEmail = async (newEmail: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (auth.currentUser) {
        await updateFirebaseEmail(auth.currentUser, newEmail);

        // Update email in Supabase
        const { error: userError } = await supabase
          .from('users')
          .update({
            email: newEmail,
            updatedAt: new Date().toISOString(),
          })
          .eq('id', auth.currentUser.uid);

        if (userError) {throw userError;}

        // Update local state
        setUser((prev) => (prev ? { ...prev, email: newEmail } : null));
      }
    } catch (err: unknown) {
      const authError = handleFirebaseError(err);
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (auth.currentUser) {
        await updateFirebasePassword(auth.currentUser, newPassword);
      }
    } catch (err: unknown) {
      const authError = handleFirebaseError(err);
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (auth.currentUser) {
        // Delete user data from Supabase
        const { error: userError } = await supabase
          .from('users')
          .delete()
          .eq('id', auth.currentUser.uid);

        if (userError) {throw userError;}

        // Delete Firebase user
        await deleteUser(auth.currentUser);
        setUser(null);
      }
    } catch (err: unknown) {
      const authError = handleFirebaseError(err);
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updatePreferences,
    signInWithGoogle,
    signInWithFacebook,
    signInWithApple,
    resetPassword,
    updateEmail,
    updatePassword,
    deleteAccount,
    uploadProfilePicture,
    deleteProfilePicture,
    updateNotificationSettings,
    updateActivityHistory,
    updateSavedItems,
    signOutEmail,
    addActivity,
    saveItem,
    removeSavedItem,
  };
};
