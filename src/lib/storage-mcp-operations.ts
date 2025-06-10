/**
 * Enhanced Firebase Storage Operations with MCP Integration
 *
 * This module provides comprehensive Firebase Storage operations integrated with MCP
 * for automated file management, processing, and optimization.
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
  UploadResult,
  UploadTask,
  StorageReference,
  FullMetadata,
  UploadMetadata
} from 'firebase/storage';
import { getFirebaseStorage } from './firebase-mcp-integration';

// Types and Interfaces
interface UploadOptions {
  metadata?: UploadMetadata;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onComplete?: (downloadURL: string) => void;
  resumable?: boolean;
  chunkSize?: number;
}

interface FileInfo {
  name: string;
  fullPath: string;
  size: number;
  contentType?: string;
  downloadURL: string;
  metadata: FullMetadata;
  lastModified: Date;
}

interface ImageProcessingOptions {
  resize?: {
    width?: number;
    height?: number;
    quality?: number;
  };
  format?: 'jpeg' | 'png' | 'webp';
  generateThumbnails?: boolean;
  thumbnailSizes?: number[];
  watermark?: {
    text?: string;
    image?: string;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity?: number;
  };
}

interface MCPStorageConfig {
  autoOptimize: boolean;
  generateThumbnails: boolean;
  enableCDN: boolean;
  compressionLevel: number;
  allowedFileTypes: string[];
  maxFileSize: number; // in bytes
  virusScan: boolean;
  backupEnabled: boolean;
}

interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

// Default MCP Storage Configuration
const defaultMCPConfig: MCPStorageConfig = {
  autoOptimize: true,
  generateThumbnails: true,
  enableCDN: true,
  compressionLevel: 80,
  allowedFileTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/json'
  ],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  virusScan: true,
  backupEnabled: true
};

// Enhanced Firebase Storage Operations Class
export class StorageMCPOperations {
  private storage = getFirebaseStorage();
  private config: MCPStorageConfig;
  private activeUploads: Map<string, UploadTask> = new Map();

  constructor(config?: Partial<MCPStorageConfig>) {
    this.config = { ...defaultMCPConfig, ...config };
  }

  /**
   * Upload a file with enhanced features and MCP integration
   */
  async uploadFile(
    path: string,
    file: File | Blob | Uint8Array,
    options: UploadOptions = {}
  ): Promise<{
    downloadURL: string;
    metadata: FullMetadata;
    uploadId: string;
  }> {
    try {
      // Validate file
      await this.validateFile(file, path);

      const storageRef = ref(this.storage, path);
      const uploadId = this.generateUploadId();

      // Prepare metadata
      const metadata: UploadMetadata = {
        ...options.metadata,
        customMetadata: {
          ...options.metadata?.customMetadata,
          uploadId,
          uploadedAt: new Date().toISOString(),
          mcpProcessed: 'false',
          originalName: file instanceof File ? file.name : 'blob',
          userId: 'system' // This should be replaced with actual user ID
        }
      };

      let uploadResult: UploadResult;

      if (options.resumable && file instanceof File) {
        // Use resumable upload for large files
        uploadResult = await this.resumableUpload(
          storageRef,
          file,
          metadata,
          options,
          uploadId
        );
      } else {
        // Use simple upload
        uploadResult = await uploadBytes(storageRef, file, metadata);
      }

      // Get download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // Process file if needed
      if (this.config.autoOptimize && this.isImageFile(file)) {
        await this.processImage(path, {
          resize: { quality: this.config.compressionLevel },
          generateThumbnails: this.config.generateThumbnails
        });
      }

      // Log upload for analytics
      await this.logUploadEvent({
        path,
        size: uploadResult.metadata.size,
        contentType: uploadResult.metadata.contentType,
        uploadId,
        downloadURL
      });

      // Trigger MCP sync
      await this.triggerMCPSync('upload', path, uploadId);

      return {
        downloadURL,
        metadata: uploadResult.metadata,
        uploadId
      };
    } catch (error) {
      console.error(`Error uploading file to ${path}:`, error);
      await this.logError('uploadFile', error, { path, fileSize: file.size });
      throw error;
    }
  }

  /**
   * Resumable upload with progress tracking
   */
  private async resumableUpload(
    storageRef: StorageReference,
    file: File,
    metadata: UploadMetadata,
    options: UploadOptions,
    uploadId: string
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);
      this.activeUploads.set(uploadId, uploadTask);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          options.onProgress?.(progress);

          console.log(`Upload ${uploadId} is ${progress}% done`);

          switch (snapshot.state) {
            case 'paused':
              console.log(`Upload ${uploadId} is paused`);
              break;
            case 'running':
              console.log(`Upload ${uploadId} is running`);
              break;
          }
        },
        (error) => {
          console.error(`Upload ${uploadId} failed:`, error);
          this.activeUploads.delete(uploadId);
          options.onError?.(error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            this.activeUploads.delete(uploadId);
            options.onComplete?.(downloadURL);
            resolve(uploadTask.snapshot);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  /**
   * Download a file
   */
  async downloadFile(path: string): Promise<{
    blob: Blob;
    metadata: FullMetadata;
    downloadURL: string;
  }> {
    try {
      const storageRef = ref(this.storage, path);
      
      // Get download URL and metadata in parallel
      const [downloadURL, metadata] = await Promise.all([
        getDownloadURL(storageRef),
        getMetadata(storageRef)
      ]);

      // Fetch the file
      const response = await fetch(downloadURL);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const blob = await response.blob();

      // Log download event
      await this.logDownloadEvent({
        path,
        size: metadata.size,
        contentType: metadata.contentType
      });

      return {
        blob,
        metadata,
        downloadURL
      };
    } catch (error) {
      console.error(`Error downloading file from ${path}:`, error);
      await this.logError('downloadFile', error, { path });
      throw error;
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(path: string): Promise<FileInfo> {
    try {
      const storageRef = ref(this.storage, path);
      const [downloadURL, metadata] = await Promise.all([
        getDownloadURL(storageRef),
        getMetadata(storageRef)
      ]);

      return {
        name: storageRef.name,
        fullPath: storageRef.fullPath,
        size: metadata.size,
        contentType: metadata.contentType,
        downloadURL,
        metadata,
        lastModified: new Date(metadata.updated)
      };
    } catch (error) {
      console.error(`Error getting file info for ${path}:`, error);
      throw error;
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(path: string = ''): Promise<{
    files: FileInfo[];
    folders: string[];
    totalSize: number;
  }> {
    try {
      const storageRef = ref(this.storage, path);
      const listResult = await listAll(storageRef);

      // Get file information for all files
      const filePromises = listResult.items.map(async (itemRef) => {
        const [downloadURL, metadata] = await Promise.all([
          getDownloadURL(itemRef),
          getMetadata(itemRef)
        ]);

        return {
          name: itemRef.name,
          fullPath: itemRef.fullPath,
          size: metadata.size,
          contentType: metadata.contentType,
          downloadURL,
          metadata,
          lastModified: new Date(metadata.updated)
        };
      });

      const files = await Promise.all(filePromises);
      const folders = listResult.prefixes.map(prefix => prefix.name);
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);

      return {
        files,
        folders,
        totalSize
      };
    } catch (error) {
      console.error(`Error listing files in ${path}:`, error);
      throw error;
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, path);
      
      // Get metadata before deletion for logging
      const metadata = await getMetadata(storageRef);
      
      await deleteObject(storageRef);

      // Delete associated thumbnails if they exist
      if (this.isImageFile({ type: metadata.contentType } as File)) {
        await this.deleteThumbnails(path);
      }

      // Log deletion event
      await this.logDeletionEvent({
        path,
        size: metadata.size,
        contentType: metadata.contentType
      });

      // Trigger MCP sync
      await this.triggerMCPSync('delete', path);
    } catch (error) {
      console.error(`Error deleting file ${path}:`, error);
      await this.logError('deleteFile', error, { path });
      throw error;
    }
  }

  /**
   * Update file metadata
   */
  async updateFileMetadata(
    path: string,
    metadata: Partial<UploadMetadata>
  ): Promise<FullMetadata> {
    try {
      const storageRef = ref(this.storage, path);
      const updatedMetadata = await updateMetadata(storageRef, metadata);

      // Log metadata update
      await this.logMetadataUpdateEvent({
        path,
        updatedFields: Object.keys(metadata)
      });

      return updatedMetadata;
    } catch (error) {
      console.error(`Error updating metadata for ${path}:`, error);
      throw error;
    }
  }

  /**
   * Copy a file to a new location
   */
  async copyFile(sourcePath: string, destinationPath: string): Promise<{
    downloadURL: string;
    metadata: FullMetadata;
  }> {
    try {
      // Download the source file
      const { blob, metadata: sourceMetadata } = await this.downloadFile(sourcePath);

      // Upload to destination
      const result = await this.uploadFile(destinationPath, blob, {
        metadata: {
          contentType: sourceMetadata.contentType,
          customMetadata: {
            ...sourceMetadata.customMetadata,
            copiedFrom: sourcePath,
            copiedAt: new Date().toISOString()
          }
        }
      });

      // Log copy event
      await this.logCopyEvent({
        sourcePath,
        destinationPath,
        size: sourceMetadata.size
      });

      return result;
    } catch (error) {
      console.error(`Error copying file from ${sourcePath} to ${destinationPath}:`, error);
      throw error;
    }
  }

  /**
   * Move a file to a new location
   */
  async moveFile(sourcePath: string, destinationPath: string): Promise<{
    downloadURL: string;
    metadata: FullMetadata;
  }> {
    try {
      // Copy the file
      const result = await this.copyFile(sourcePath, destinationPath);

      // Delete the source file
      await this.deleteFile(sourcePath);

      // Log move event
      await this.logMoveEvent({
        sourcePath,
        destinationPath,
        size: result.metadata.size
      });

      return result;
    } catch (error) {
      console.error(`Error moving file from ${sourcePath} to ${destinationPath}:`, error);
      throw error;
    }
  }

  /**
   * Process image with various options
   */
  async processImage(
    path: string,
    options: ImageProcessingOptions
  ): Promise<{
    originalURL: string;
    processedURL?: string;
    thumbnails?: { size: number; url: string }[];
  }> {
    try {
      const storageRef = ref(this.storage, path);
      const originalURL = await getDownloadURL(storageRef);

      // This is a placeholder for image processing
      // In a real implementation, you would use a service like
      // Cloud Functions with Sharp, or integrate with a service like Cloudinary
      
      console.log('Processing image:', path, options);

      // Generate thumbnails if requested
      let thumbnails: { size: number; url: string }[] = [];
      if (options.generateThumbnails && options.thumbnailSizes) {
        thumbnails = await this.generateThumbnails(path, options.thumbnailSizes);
      }

      // Log image processing event
      await this.logImageProcessingEvent({
        path,
        options,
        thumbnailsGenerated: thumbnails.length
      });

      return {
        originalURL,
        thumbnails
      };
    } catch (error) {
      console.error(`Error processing image ${path}:`, error);
      throw error;
    }
  }

  /**
   * Generate thumbnails for an image
   */
  private async generateThumbnails(
    imagePath: string,
    sizes: number[]
  ): Promise<{ size: number; url: string }[]> {
    const thumbnails: { size: number; url: string }[] = [];

    for (const size of sizes) {
      try {
        // This is a placeholder - in reality, you'd use Cloud Functions
        // or an image processing service to generate actual thumbnails
        const thumbnailPath = `thumbnails/${size}x${size}_${imagePath}`;
        
        // For now, just return the original URL
        // In a real implementation, you would:
        // 1. Download the original image
        // 2. Resize it using Sharp or similar
        // 3. Upload the resized version
        const originalRef = ref(this.storage, imagePath);
        const thumbnailURL = await getDownloadURL(originalRef);

        thumbnails.push({
          size,
          url: thumbnailURL
        });
      } catch (error) {
        console.error(`Error generating thumbnail ${size}x${size} for ${imagePath}:`, error);
      }
    }

    return thumbnails;
  }

  /**
   * Delete thumbnails associated with an image
   */
  private async deleteThumbnails(imagePath: string): Promise<void> {
    try {
      const thumbnailSizes = [150, 300, 600]; // Common thumbnail sizes
      
      for (const size of thumbnailSizes) {
        try {
          const thumbnailPath = `thumbnails/${size}x${size}_${imagePath}`;
          const thumbnailRef = ref(this.storage, thumbnailPath);
          await deleteObject(thumbnailRef);
        } catch (error) {
          // Ignore errors for non-existent thumbnails
          console.log(`Thumbnail ${size}x${size}_${imagePath} not found or already deleted`);
        }
      }
    } catch (error) {
      console.error(`Error deleting thumbnails for ${imagePath}:`, error);
    }
  }

  /**
   * Pause an active upload
   */
  pauseUpload(uploadId: string): boolean {
    const uploadTask = this.activeUploads.get(uploadId);
    if (uploadTask) {
      uploadTask.pause();
      return true;
    }
    return false;
  }

  /**
   * Resume a paused upload
   */
  resumeUpload(uploadId: string): boolean {
    const uploadTask = this.activeUploads.get(uploadId);
    if (uploadTask) {
      uploadTask.resume();
      return true;
    }
    return false;
  }

  /**
   * Cancel an active upload
   */
  cancelUpload(uploadId: string): boolean {
    const uploadTask = this.activeUploads.get(uploadId);
    if (uploadTask) {
      uploadTask.cancel();
      this.activeUploads.delete(uploadId);
      return true;
    }
    return false;
  }

  /**
   * Get upload progress
   */
  getUploadProgress(uploadId: string): UploadProgress | null {
    const uploadTask = this.activeUploads.get(uploadId);
    if (uploadTask && uploadTask.snapshot) {
      const snapshot = uploadTask.snapshot;
      return {
        bytesTransferred: snapshot.bytesTransferred,
        totalBytes: snapshot.totalBytes,
        percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        state: snapshot.state as any
      };
    }
    return null;
  }

  /**
   * Validate file before upload
   */
  private async validateFile(file: File | Blob | Uint8Array, path: string): Promise<void> {
    // Check file size
    if (file.size > this.config.maxFileSize) {
      throw new Error(`File size ${file.size} exceeds maximum allowed size ${this.config.maxFileSize}`);
    }

    // Check file type
    if (file instanceof File || (file as Blob).type) {
      const fileType = (file as File | Blob).type;
      if (!this.config.allowedFileTypes.includes(fileType)) {
        throw new Error(`File type ${fileType} is not allowed`);
      }
    }

    // Additional validation can be added here
    // e.g., virus scanning, content validation, etc.
  }

  /**
   * Check if file is an image
   */
  private isImageFile(file: File | Blob | { type?: string }): boolean {
    const type = (file as File | Blob).type || (file as { type?: string }).type;
    return type ? type.startsWith('image/') : false;
  }

  /**
   * Generate unique upload ID
   */
  private generateUploadId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Logging methods for analytics and monitoring
  private async logUploadEvent(data: any): Promise<void> {
    console.log('Upload event:', data);
    // Implementation would log to analytics service
  }

  private async logDownloadEvent(data: any): Promise<void> {
    console.log('Download event:', data);
  }

  private async logDeletionEvent(data: any): Promise<void> {
    console.log('Deletion event:', data);
  }

  private async logMetadataUpdateEvent(data: any): Promise<void> {
    console.log('Metadata update event:', data);
  }

  private async logCopyEvent(data: any): Promise<void> {
    console.log('Copy event:', data);
  }

  private async logMoveEvent(data: any): Promise<void> {
    console.log('Move event:', data);
  }

  private async logImageProcessingEvent(data: any): Promise<void> {
    console.log('Image processing event:', data);
  }

  private async logError(operation: string, error: any, context?: any): Promise<void> {
    console.error(`Storage operation error - ${operation}:`, error, context);
    // Implementation would log to error tracking service
  }

  /**
   * Trigger MCP sync for external systems
   */
  private async triggerMCPSync(
    operation: string,
    path: string,
    uploadId?: string
  ): Promise<void> {
    try {
      console.log(`MCP Storage Sync triggered: ${operation} on ${path}`, { uploadId });
      // Implementation would integrate with MCP server
    } catch (error) {
      console.error('Error triggering MCP storage sync:', error);
    }
  }
}

// Export singleton instance
export const storageMCP = new StorageMCPOperations();

// Export convenience functions
export const uploadFile = storageMCP.uploadFile.bind(storageMCP);
export const downloadFile = storageMCP.downloadFile.bind(storageMCP);
export const getFileInfo = storageMCP.getFileInfo.bind(storageMCP);
export const listFiles = storageMCP.listFiles.bind(storageMCP);
export const deleteFile = storageMCP.deleteFile.bind(storageMCP);
export const updateFileMetadata = storageMCP.updateFileMetadata.bind(storageMCP);
export const copyFile = storageMCP.copyFile.bind(storageMCP);
export const moveFile = storageMCP.moveFile.bind(storageMCP);
export const processImage = storageMCP.processImage.bind(storageMCP);
export const pauseUpload = storageMCP.pauseUpload.bind(storageMCP);
export const resumeUpload = storageMCP.resumeUpload.bind(storageMCP);
export const cancelUpload = storageMCP.cancelUpload.bind(storageMCP);
export const getUploadProgress = storageMCP.getUploadProgress.bind(storageMCP);

// Export types
export type {
  UploadOptions,
  FileInfo,
  ImageProcessingOptions,
  MCPStorageConfig,
  UploadProgress
};

// Default export
export default storageMCP;