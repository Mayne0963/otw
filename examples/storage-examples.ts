/**
 * Firebase Storage Examples
 * 
 * This file demonstrates how to handle file uploads, downloads, and management
 * using Firebase Storage with proper error handling and progress tracking.
 */

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata,
  UploadTask,
  UploadTaskSnapshot
} from 'firebase/storage';
import { doc, updateDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { storage, db } from '../src/firebase-config';

// =============================================================================
// TYPES
// =============================================================================

interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

interface FileMetadata {
  name: string;
  size: number;
  contentType: string;
  timeCreated: string;
  updated: string;
  downloadURL?: string;
  customMetadata?: Record<string, string>;
}

interface UploadResult {
  downloadURL: string;
  fullPath: string;
  name: string;
  size: number;
  contentType: string;
}

// =============================================================================
// PROFILE IMAGE UPLOAD
// =============================================================================

/**
 * Upload user profile image
 */
export async function uploadProfileImage(
  userId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('File size must be less than 5MB');
    }
    
    // Create storage reference
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `profile-images/${userId}/${fileName}`);
    
    // Set metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        userId,
        uploadedAt: new Date().toISOString(),
        originalName: file.name
      }
    };
    
    // Upload with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progress: UploadProgress = {
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            state: snapshot.state as any
          };
          onProgress?.(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          reject(new Error(`Upload failed: ${error.message}`));
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Update user profile in Firestore
            await updateDoc(doc(db, 'users', userId), {
              photoURL: downloadURL,
              updatedAt: Timestamp.now()
            });
            
            const result: UploadResult = {
              downloadURL,
              fullPath: uploadTask.snapshot.ref.fullPath,
              name: uploadTask.snapshot.ref.name,
              size: file.size,
              contentType: file.type
            };
            
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
}

// =============================================================================
// RESTAURANT IMAGE UPLOAD
// =============================================================================

/**
 * Upload restaurant images (multiple files)
 */
export async function uploadRestaurantImages(
  restaurantId: string,
  files: FileList,
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<UploadResult[]> {
  try {
    const uploadPromises: Promise<UploadResult>[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error(`File ${file.name} must be an image`);
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit for restaurant images
        throw new Error(`File ${file.name} size must be less than 10MB`);
      }
      
      const uploadPromise = uploadSingleRestaurantImage(
        restaurantId,
        file,
        i,
        (progress) => onProgress?.(i, progress)
      );
      
      uploadPromises.push(uploadPromise);
    }
    
    const results = await Promise.all(uploadPromises);
    
    // Update restaurant document with image URLs
    const imageUrls = results.map(result => result.downloadURL);
    await updateDoc(doc(db, 'restaurants', restaurantId), {
      imageUrls,
      updatedAt: Timestamp.now()
    });
    
    return results;
  } catch (error) {
    console.error('Error uploading restaurant images:', error);
    throw error;
  }
}

/**
 * Upload single restaurant image
 */
async function uploadSingleRestaurantImage(
  restaurantId: string,
  file: File,
  index: number,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const fileName = `${Date.now()}_${index}_${file.name}`;
  const storageRef = ref(storage, `restaurant-images/${restaurantId}/${fileName}`);
  
  const metadata = {
    contentType: file.type,
    customMetadata: {
      restaurantId,
      uploadedAt: new Date().toISOString(),
      originalName: file.name,
      imageIndex: index.toString()
    }
  };
  
  const uploadTask = uploadBytesResumable(storageRef, file, metadata);
  
  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progress: UploadProgress = {
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          state: snapshot.state as any
        };
        onProgress?.(progress);
      },
      (error) => {
        reject(new Error(`Upload failed: ${error.message}`));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          const result: UploadResult = {
            downloadURL,
            fullPath: uploadTask.snapshot.ref.fullPath,
            name: uploadTask.snapshot.ref.name,
            size: file.size,
            contentType: file.type
          };
          
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

// =============================================================================
// SCREENSHOT UPLOAD (FOR ORDERS)
// =============================================================================

/**
 * Upload order screenshot
 */
export async function uploadOrderScreenshot(
  orderId: string,
  userId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
    
    if (file.size > 15 * 1024 * 1024) { // 15MB limit for screenshots
      throw new Error('File size must be less than 15MB');
    }
    
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `screenshots/${userId}/${orderId}/${fileName}`);
    
    const metadata = {
      contentType: file.type,
      customMetadata: {
        orderId,
        userId,
        uploadedAt: new Date().toISOString(),
        originalName: file.name,
        type: 'order_screenshot'
      }
    };
    
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progress: UploadProgress = {
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            state: snapshot.state as any
          };
          onProgress?.(progress);
        },
        (error) => {
          reject(new Error(`Upload failed: ${error.message}`));
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Update screenshot order document
            await updateDoc(doc(db, 'screenshot_orders', orderId), {
              screenshotUrl: downloadURL,
              status: 'screenshot_uploaded',
              updatedAt: Timestamp.now()
            });
            
            const result: UploadResult = {
              downloadURL,
              fullPath: uploadTask.snapshot.ref.fullPath,
              name: uploadTask.snapshot.ref.name,
              size: file.size,
              contentType: file.type
            };
            
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading screenshot:', error);
    throw error;
  }
}

// =============================================================================
// DOCUMENT UPLOAD (RECEIPTS, INVOICES)
// =============================================================================

/**
 * Upload document (PDF, images)
 */
export async function uploadDocument(
  userId: string,
  file: File,
  documentType: 'receipt' | 'invoice' | 'other',
  relatedId?: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Validate file type
    const allowedTypes = ['image/', 'application/pdf', 'text/plain'];
    const isValidType = allowedTypes.some(type => file.type.startsWith(type));
    
    if (!isValidType) {
      throw new Error('File must be an image, PDF, or text file');
    }
    
    if (file.size > 20 * 1024 * 1024) { // 20MB limit for documents
      throw new Error('File size must be less than 20MB');
    }
    
    const fileName = `${Date.now()}_${file.name}`;
    const folderPath = relatedId 
      ? `documents/${userId}/${documentType}/${relatedId}`
      : `documents/${userId}/${documentType}`;
    const storageRef = ref(storage, `${folderPath}/${fileName}`);
    
    const metadata = {
      contentType: file.type,
      customMetadata: {
        userId,
        documentType,
        relatedId: relatedId || '',
        uploadedAt: new Date().toISOString(),
        originalName: file.name
      }
    };
    
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progress: UploadProgress = {
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            state: snapshot.state as any
          };
          onProgress?.(progress);
        },
        (error) => {
          reject(new Error(`Upload failed: ${error.message}`));
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Log document upload
            await addDoc(collection(db, 'document_uploads'), {
              userId,
              documentType,
              relatedId: relatedId || null,
              fileName: file.name,
              fileSize: file.size,
              contentType: file.type,
              downloadURL,
              storagePath: uploadTask.snapshot.ref.fullPath,
              uploadedAt: Timestamp.now()
            });
            
            const result: UploadResult = {
              downloadURL,
              fullPath: uploadTask.snapshot.ref.fullPath,
              name: uploadTask.snapshot.ref.name,
              size: file.size,
              contentType: file.type
            };
            
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

// =============================================================================
// FILE MANAGEMENT
// =============================================================================

/**
 * Get file metadata
 */
export async function getFileMetadata(filePath: string): Promise<FileMetadata> {
  try {
    const fileRef = ref(storage, filePath);
    const metadata = await getMetadata(fileRef);
    const downloadURL = await getDownloadURL(fileRef);
    
    return {
      name: metadata.name,
      size: metadata.size,
      contentType: metadata.contentType || 'unknown',
      timeCreated: metadata.timeCreated,
      updated: metadata.updated,
      downloadURL,
      customMetadata: metadata.customMetadata
    };
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
}

/**
 * List files in a directory
 */
export async function listFiles(folderPath: string): Promise<FileMetadata[]> {
  try {
    const folderRef = ref(storage, folderPath);
    const result = await listAll(folderRef);
    
    const filePromises = result.items.map(async (itemRef) => {
      try {
        const metadata = await getMetadata(itemRef);
        const downloadURL = await getDownloadURL(itemRef);
        
        return {
          name: metadata.name,
          size: metadata.size,
          contentType: metadata.contentType || 'unknown',
          timeCreated: metadata.timeCreated,
          updated: metadata.updated,
          downloadURL,
          customMetadata: metadata.customMetadata
        };
      } catch (error) {
        console.error(`Error getting metadata for ${itemRef.name}:`, error);
        return null;
      }
    });
    
    const files = await Promise.all(filePromises);
    return files.filter((file): file is FileMetadata => file !== null);
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}

/**
 * Delete file
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    console.log('File deleted successfully:', filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Update file metadata
 */
export async function updateFileMetadata(
  filePath: string,
  newMetadata: Record<string, string>
): Promise<void> {
  try {
    const fileRef = ref(storage, filePath);
    await updateMetadata(fileRef, {
      customMetadata: newMetadata
    });
    console.log('File metadata updated:', filePath);
  } catch (error) {
    console.error('Error updating file metadata:', error);
    throw error;
  }
}

// =============================================================================
// BATCH OPERATIONS
// =============================================================================

/**
 * Delete multiple files
 */
export async function deleteMultipleFiles(filePaths: string[]): Promise<void> {
  try {
    const deletePromises = filePaths.map(path => deleteFile(path));
    await Promise.all(deletePromises);
    console.log('Multiple files deleted successfully');
  } catch (error) {
    console.error('Error deleting multiple files:', error);
    throw error;
  }
}

/**
 * Clean up old files (older than specified days)
 */
export async function cleanupOldFiles(
  folderPath: string,
  daysOld: number = 30
): Promise<number> {
  try {
    const files = await listFiles(folderPath);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const oldFiles = files.filter(file => {
      const fileDate = new Date(file.timeCreated);
      return fileDate < cutoffDate;
    });
    
    if (oldFiles.length === 0) {
      console.log('No old files to clean up');
      return 0;
    }
    
    const deletePromises = oldFiles.map(file => {
      const filePath = `${folderPath}/${file.name}`;
      return deleteFile(filePath);
    });
    
    await Promise.all(deletePromises);
    console.log(`Cleaned up ${oldFiles.length} old files`);
    return oldFiles.length;
  } catch (error) {
    console.error('Error cleaning up old files:', error);
    throw error;
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate thumbnail from image file
 */
export async function generateThumbnail(
  file: File,
  maxWidth: number = 200,
  maxHeight: number = 200,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate thumbnail'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Validate file type and size
 */
export function validateFile(
  file: File,
  allowedTypes: string[],
  maxSizeMB: number
): { isValid: boolean; error?: string } {
  // Check file type
  const isValidType = allowedTypes.some(type => 
    file.type.startsWith(type) || file.type === type
  );
  
  if (!isValidType) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size too large. Maximum size: ${maxSizeMB}MB`
    };
  }
  
  return { isValid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = getFileExtension(originalName);
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  
  const prefixPart = prefix ? `${prefix}_` : '';
  return `${prefixPart}${timestamp}_${random}_${baseName}.${extension}`;
}

// =============================================================================
// EXAMPLE USAGE
// =============================================================================

export async function exampleUsage() {
  try {
    // Example: Upload profile image
    const profileImageFile = new File([''], 'profile.jpg', { type: 'image/jpeg' });
    const profileResult = await uploadProfileImage(
      'user123',
      profileImageFile,
      (progress) => {
        console.log(`Profile upload progress: ${progress.percentage.toFixed(2)}%`);
      }
    );
    console.log('Profile image uploaded:', profileResult.downloadURL);
    
    // Example: Upload restaurant images
    const restaurantFiles = new FileList(); // In real usage, this comes from input element
    // const restaurantResults = await uploadRestaurantImages(
    //   'restaurant123',
    //   restaurantFiles,
    //   (fileIndex, progress) => {
    //     console.log(`File ${fileIndex} progress: ${progress.percentage.toFixed(2)}%`);
    //   }
    // );
    
    // Example: List files in a directory
    const files = await listFiles('profile-images/user123');
    console.log('Files in directory:', files);
    
    // Example: Clean up old files
    const cleanedCount = await cleanupOldFiles('screenshots', 7); // Delete files older than 7 days
    console.log(`Cleaned up ${cleanedCount} old files`);
    
  } catch (error) {
    console.error('Example usage error:', error);
  }
}