/**
 * Firebase Storage Integration with Upload/Download Examples
 * Includes file upload, download, metadata management, and security
 */

import {
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata,
  StorageReference,
  UploadTask,
  UploadTaskSnapshot,
  FullMetadata,
} from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';
import { app } from '../firebase-enhanced';

const storage = getStorage(app);
const auth = getAuth(app);
const db = getFirestore(app);

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

export interface FileUploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onError?: (error: Error) => void;
  onComplete?: (downloadURL: string) => void;
  metadata?: {
    contentType?: string;
    customMetadata?: Record<string, string>;
  };
}

export interface FileInfo {
  name: string;
  fullPath: string;
  size: number;
  contentType: string;
  downloadURL: string;
  timeCreated: string;
  updated: string;
  customMetadata?: Record<string, string>;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get current user ID
 */
function getCurrentUserId(): string {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated to access storage');
  }
  return user.uid;
}

/**
 * Generate unique filename
 */
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '');
  return `${nameWithoutExtension}_${timestamp}_${randomString}.${extension}`;
}

/**
 * Validate file type
 */
function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -1));
    }
    return file.type === type;
  });
}

/**
 * Validate file size
 */
function validateFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

// ============================================================================
// PROFILE IMAGE MANAGEMENT
// ============================================================================

/**
 * Upload user profile image
 */
export async function uploadProfileImage(
  file: File,
  options: FileUploadOptions = {}
): Promise<string> {
  const userId = getCurrentUserId();
  
  // Validate file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validateFileType(file, allowedTypes)) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
  }
  
  if (!validateFileSize(file, 5)) { // 5MB limit
    throw new Error('File size must be less than 5MB.');
  }

  const filename = generateUniqueFilename(file.name);
  const storageRef = ref(storage, `profile-images/${userId}/${filename}`);
  
  const metadata = {
    contentType: file.type,
    customMetadata: {
      uploadedBy: userId,
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
      ...options.metadata?.customMetadata
    }
  };

  try {
    if (options.onProgress) {
      // Use resumable upload for progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);
      
      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot: UploadTaskSnapshot) => {
            const progress: UploadProgress = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
              state: snapshot.state as any
            };
            options.onProgress!(progress);
          },
          (error) => {
            options.onError?.(error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              // Update user profile with new image URL
              await updateDoc(doc(db, 'users', userId), {
                photoURL: downloadURL,
                updatedAt: new Date()
              });
              
              options.onComplete?.(downloadURL);
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } else {
      // Simple upload without progress tracking
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update user profile with new image URL
      await updateDoc(doc(db, 'users', userId), {
        photoURL: downloadURL,
        updatedAt: new Date()
      });
      
      return downloadURL;
    }
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
}

/**
 * Delete user profile image
 */
export async function deleteProfileImage(imageURL: string): Promise<void> {
  const userId = getCurrentUserId();
  
  try {
    // Extract path from URL
    const url = new URL(imageURL);
    const pathMatch = url.pathname.match(/\/o\/(.*?)\?/);
    if (!pathMatch) {
      throw new Error('Invalid image URL');
    }
    
    const imagePath = decodeURIComponent(pathMatch[1]);
    
    // Verify user owns this image
    if (!imagePath.startsWith(`profile-images/${userId}/`)) {
      throw new Error('Unauthorized: Cannot delete this image');
    }
    
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
    
    // Update user profile to remove image URL
    await updateDoc(doc(db, 'users', userId), {
      photoURL: null,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error deleting profile image:', error);
    throw error;
  }
}

// ============================================================================
// SCREENSHOT MANAGEMENT
// ============================================================================

/**
 * Upload screenshot for order processing
 */
export async function uploadScreenshot(
  file: File,
  options: FileUploadOptions = {}
): Promise<{ downloadURL: string; storagePath: string }> {
  const userId = getCurrentUserId();
  
  // Validate file
  const allowedTypes = ['image/*'];
  if (!validateFileType(file, allowedTypes)) {
    throw new Error('Invalid file type. Only images are allowed.');
  }
  
  if (!validateFileSize(file, 10)) { // 10MB limit for screenshots
    throw new Error('File size must be less than 10MB.');
  }

  const filename = generateUniqueFilename(file.name);
  const storagePath = `screenshots/${userId}/${filename}`;
  const storageRef = ref(storage, storagePath);
  
  const metadata = {
    contentType: file.type,
    customMetadata: {
      uploadedBy: userId,
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
      purpose: 'order-screenshot',
      ...options.metadata?.customMetadata
    }
  };

  try {
    if (options.onProgress) {
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);
      
      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot: UploadTaskSnapshot) => {
            const progress: UploadProgress = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
              state: snapshot.state as any
            };
            options.onProgress!(progress);
          },
          (error) => {
            options.onError?.(error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              options.onComplete?.(downloadURL);
              resolve({ downloadURL, storagePath });
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } else {
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { downloadURL, storagePath };
    }
  } catch (error) {
    console.error('Error uploading screenshot:', error);
    throw error;
  }
}

/**
 * Get user's uploaded screenshots
 */
export async function getUserScreenshots(): Promise<FileInfo[]> {
  const userId = getCurrentUserId();
  const screenshotsRef = ref(storage, `screenshots/${userId}`);
  
  try {
    const listResult = await listAll(screenshotsRef);
    const fileInfoPromises = listResult.items.map(async (itemRef) => {
      const [metadata, downloadURL] = await Promise.all([
        getMetadata(itemRef),
        getDownloadURL(itemRef)
      ]);
      
      return {
        name: metadata.name,
        fullPath: metadata.fullPath,
        size: metadata.size,
        contentType: metadata.contentType || 'unknown',
        downloadURL,
        timeCreated: metadata.timeCreated,
        updated: metadata.updated,
        customMetadata: metadata.customMetadata
      };
    });
    
    return await Promise.all(fileInfoPromises);
  } catch (error) {
    console.error('Error getting user screenshots:', error);
    throw error;
  }
}

// ============================================================================
// DOCUMENT MANAGEMENT
// ============================================================================

/**
 * Upload document (receipts, invoices, etc.)
 */
export async function uploadDocument(
  file: File,
  category: 'receipts' | 'invoices' | 'other',
  options: FileUploadOptions = {}
): Promise<{ downloadURL: string; storagePath: string }> {
  const userId = getCurrentUserId();
  
  // Validate file
  const allowedTypes = [
    'application/pdf',
    'image/*',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (!validateFileType(file, allowedTypes)) {
    throw new Error('Invalid file type. Only PDF, images, and Word documents are allowed.');
  }
  
  if (!validateFileSize(file, 25)) { // 25MB limit for documents
    throw new Error('File size must be less than 25MB.');
  }

  const filename = generateUniqueFilename(file.name);
  const storagePath = `documents/${userId}/${category}/${filename}`;
  const storageRef = ref(storage, storagePath);
  
  const metadata = {
    contentType: file.type,
    customMetadata: {
      uploadedBy: userId,
      originalName: file.name,
      category,
      uploadedAt: new Date().toISOString(),
      ...options.metadata?.customMetadata
    }
  };

  try {
    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { downloadURL, storagePath };
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  basePath: string,
  options: FileUploadOptions = {}
): Promise<Array<{ file: File; downloadURL: string; storagePath: string; error?: Error }>> {
  const userId = getCurrentUserId();
  
  const uploadPromises = files.map(async (file) => {
    try {
      const filename = generateUniqueFilename(file.name);
      const storagePath = `${basePath}/${userId}/${filename}`;
      const storageRef = ref(storage, storagePath);
      
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: userId,
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          ...options.metadata?.customMetadata
        }
      };
      
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return { file, downloadURL, storagePath };
    } catch (error) {
      return { file, downloadURL: '', storagePath: '', error: error as Error };
    }
  });
  
  return await Promise.all(uploadPromises);
}

/**
 * Delete multiple files
 */
export async function deleteMultipleFiles(filePaths: string[]): Promise<Array<{ path: string; success: boolean; error?: Error }>> {
  const deletePromises = filePaths.map(async (path) => {
    try {
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
      return { path, success: true };
    } catch (error) {
      return { path, success: false, error: error as Error };
    }
  });
  
  return await Promise.all(deletePromises);
}

// ============================================================================
// METADATA MANAGEMENT
// ============================================================================

/**
 * Update file metadata
 */
export async function updateFileMetadata(
  filePath: string,
  newMetadata: { customMetadata?: Record<string, string> }
): Promise<FullMetadata> {
  const fileRef = ref(storage, filePath);
  
  try {
    return await updateMetadata(fileRef, newMetadata);
  } catch (error) {
    console.error('Error updating file metadata:', error);
    throw error;
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(filePath: string): Promise<FullMetadata> {
  const fileRef = ref(storage, filePath);
  
  try {
    return await getMetadata(fileRef);
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
}

// ============================================================================
// DOWNLOAD UTILITIES
// ============================================================================

/**
 * Get download URL for a file
 */
export async function getFileDownloadURL(filePath: string): Promise<string> {
  const fileRef = ref(storage, filePath);
  
  try {
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error('Error getting download URL:', error);
    throw error;
  }
}

/**
 * Download file as blob
 */
export async function downloadFileAsBlob(filePath: string): Promise<Blob> {
  const downloadURL = await getFileDownloadURL(filePath);
  
  try {
    const response = await fetch(downloadURL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.blob();
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}

// ============================================================================
// CLEANUP UTILITIES
// ============================================================================

/**
 * Clean up old files (for admin use)
 */
export async function cleanupOldFiles(
  basePath: string,
  olderThanDays: number
): Promise<{ deletedCount: number; errors: Error[] }> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
  
  const folderRef = ref(storage, basePath);
  const errors: Error[] = [];
  let deletedCount = 0;
  
  try {
    const listResult = await listAll(folderRef);
    
    for (const itemRef of listResult.items) {
      try {
        const metadata = await getMetadata(itemRef);
        const fileDate = new Date(metadata.timeCreated);
        
        if (fileDate < cutoffDate) {
          await deleteObject(itemRef);
          deletedCount++;
        }
      } catch (error) {
        errors.push(error as Error);
      }
    }
    
    return { deletedCount, errors };
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
}

// ============================================================================
// REACT HOOKS (Optional)
// ============================================================================

/**
 * Custom hook for file upload with progress
 */
export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const uploadFile = async (
    file: File,
    uploadFunction: (file: File, options: FileUploadOptions) => Promise<any>
  ) => {
    setUploading(true);
    setError(null);
    setProgress(null);
    
    try {
      const result = await uploadFunction(file, {
        onProgress: setProgress,
        onError: setError
      });
      
      setUploading(false);
      return result;
    } catch (err) {
      setError(err as Error);
      setUploading(false);
      throw err;
    }
  };
  
  return {
    uploading,
    progress,
    error,
    uploadFile
  };
}

// Note: Import useState from React if using the hook
// import { useState } from 'react';