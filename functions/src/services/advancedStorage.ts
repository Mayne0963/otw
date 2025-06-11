import { Storage } from '@google-cloud/storage';
import { getStorage } from 'firebase-admin/storage';
import { logger } from 'firebase-functions';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onObjectFinalized, onObjectDeleted } from 'firebase-functions/v2/storage';
import { getFirestore } from 'firebase-admin/firestore';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

interface UploadOptions {
  userId: string;
  folder: string;
  fileName?: string;
  contentType?: string;
  metadata?: Record<string, string>;
  generateThumbnail?: boolean;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
}

interface SignedUrlOptions {
  action: 'read' | 'write' | 'delete';
  expires: Date;
  contentType?: string;
  extensionHeaders?: Record<string, string>;
}

interface ResizeOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

class AdvancedStorageService {
  private storage: Storage;
  private bucket: any;
  private db = getFirestore();

  constructor() {
    this.storage = new Storage();
    this.bucket = getStorage().bucket();
  }

  /**
   * Generate signed URL for large file uploads
   * Requires Blaze plan for external API calls and advanced storage features
   */
  async generateSignedUrl(
    filePath: string,
    options: SignedUrlOptions
  ): Promise<string> {
    try {
      const file = this.bucket.file(filePath);
      
      const signedUrlOptions = {
        version: 'v4' as const,
        action: options.action,
        expires: options.expires,
        contentType: options.contentType,
        extensionHeaders: options.extensionHeaders,
      };

      const [signedUrl] = await file.getSignedUrl(signedUrlOptions);
      
      logger.info(`Generated signed URL for ${filePath}`);
      return signedUrl;
    } catch (error) {
      logger.error('Error generating signed URL:', error);
      throw new HttpsError('internal', 'Failed to generate signed URL');
    }
  }

  /**
   * Generate resumable upload URL for large files
   * Requires Blaze plan for advanced storage operations
   */
  async generateResumableUploadUrl(
    filePath: string,
    options: UploadOptions
  ): Promise<string> {
    try {
      const file = this.bucket.file(filePath);
      
      const resumableOptions = {
        version: 'v4' as const,
        action: 'resumable' as const,
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType: options.contentType || 'application/octet-stream',
        extensionHeaders: {
          'x-goog-meta-user-id': options.userId,
          'x-goog-meta-folder': options.folder,
          ...options.metadata,
        },
      };

      const [resumableUrl] = await file.getSignedUrl(resumableOptions);
      
      // Store upload session info
      await this.db.collection('uploadSessions').add({
        userId: options.userId,
        filePath,
        resumableUrl,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        status: 'pending',
        metadata: options.metadata,
      });
      
      logger.info(`Generated resumable upload URL for ${filePath}`);
      return resumableUrl;
    } catch (error) {
      logger.error('Error generating resumable upload URL:', error);
      throw new HttpsError('internal', 'Failed to generate resumable upload URL');
    }
  }

  /**
   * Process and resize images
   * Requires Blaze plan for image processing operations
   */
  async processImage(
    sourceFilePath: string,
    destinationFilePath: string,
    resizeOptions: ResizeOptions
  ): Promise<void> {
    try {
      const sourceFile = this.bucket.file(sourceFilePath);
      const destinationFile = this.bucket.file(destinationFilePath);
      
      // Download source image
      const [imageBuffer] = await sourceFile.download();
      
      // Process image with Sharp
      let sharpInstance = sharp(imageBuffer);
      
      if (resizeOptions.width || resizeOptions.height) {
        sharpInstance = sharpInstance.resize({
          width: resizeOptions.width,
          height: resizeOptions.height,
          fit: resizeOptions.fit || 'cover',
          withoutEnlargement: true,
        });
      }
      
      if (resizeOptions.format) {
        switch (resizeOptions.format) {
          case 'jpeg':
            sharpInstance = sharpInstance.jpeg({ quality: resizeOptions.quality || 80 });
            break;
          case 'png':
            sharpInstance = sharpInstance.png({ quality: resizeOptions.quality || 80 });
            break;
          case 'webp':
            sharpInstance = sharpInstance.webp({ quality: resizeOptions.quality || 80 });
            break;
        }
      }
      
      const processedBuffer = await sharpInstance.toBuffer();
      
      // Upload processed image
      await destinationFile.save(processedBuffer, {
        metadata: {
          contentType: `image/${resizeOptions.format || 'jpeg'}`,
          metadata: {
            processedAt: new Date().toISOString(),
            originalFile: sourceFilePath,
            ...resizeOptions,
          },
        },
      });
      
      logger.info(`Processed image: ${sourceFilePath} -> ${destinationFilePath}`);
    } catch (error) {
      logger.error('Error processing image:', error);
      throw new HttpsError('internal', 'Failed to process image');
    }
  }

  /**
   * Generate multiple image variants
   * Requires Blaze plan for batch processing
   */
  async generateImageVariants(
    sourceFilePath: string,
    variants: Array<{ suffix: string; options: ResizeOptions }>
  ): Promise<string[]> {
    try {
      const generatedPaths: string[] = [];
      const basePath = sourceFilePath.replace(/\.[^/.]+$/, '');
      const extension = sourceFilePath.split('.').pop();
      
      for (const variant of variants) {
        const variantPath = `${basePath}_${variant.suffix}.${variant.options.format || extension}`;
        await this.processImage(sourceFilePath, variantPath, variant.options);
        generatedPaths.push(variantPath);
      }
      
      logger.info(`Generated ${variants.length} image variants for ${sourceFilePath}`);
      return generatedPaths;
    } catch (error) {
      logger.error('Error generating image variants:', error);
      throw new HttpsError('internal', 'Failed to generate image variants');
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(
    fileName: string,
    fileSize: number,
    contentType: string,
    options: UploadOptions
  ): void {
    // Check file size
    const maxSize = options.maxFileSize || 50 * 1024 * 1024; // 50MB default
    if (fileSize > maxSize) {
      throw new HttpsError(
        'invalid-argument',
        `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`
      );
    }
    
    // Check file type
    if (options.allowedTypes && !options.allowedTypes.includes(contentType)) {
      throw new HttpsError(
        'invalid-argument',
        `File type ${contentType} is not allowed`
      );
    }
    
    // Check file name
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    if (sanitizedName !== fileName) {
      throw new HttpsError(
        'invalid-argument',
        'File name contains invalid characters'
      );
    }
  }

  /**
   * Get file metadata and download URL
   */
  async getFileInfo(filePath: string): Promise<any> {
    try {
      const file = this.bucket.file(filePath);
      const [metadata] = await file.getMetadata();
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      });
      
      return {
        name: metadata.name,
        size: metadata.size,
        contentType: metadata.contentType,
        created: metadata.timeCreated,
        updated: metadata.updated,
        downloadUrl: signedUrl,
        metadata: metadata.metadata,
      };
    } catch (error) {
      logger.error('Error getting file info:', error);
      throw new HttpsError('not-found', 'File not found');
    }
  }

  /**
   * Delete file and its variants
   */
  async deleteFileWithVariants(filePath: string): Promise<void> {
    try {
      const basePath = filePath.replace(/\.[^/.]+$/, '');
      const [files] = await this.bucket.getFiles({
        prefix: basePath,
      });
      
      const deletePromises = files.map(file => file.delete());
      await Promise.all(deletePromises);
      
      logger.info(`Deleted ${files.length} files with base path: ${basePath}`);
    } catch (error) {
      logger.error('Error deleting files:', error);
      throw new HttpsError('internal', 'Failed to delete files');
    }
  }
}

const storageService = new AdvancedStorageService();

// Cloud Function to generate signed upload URL
export const generateUploadUrl = onCall(
  { region: 'us-central1', memory: '256MiB' },
  async (request) => {
    const { filePath, options } = request.data;
    
    if (!filePath || !options) {
      throw new HttpsError('invalid-argument', 'File path and options are required');
    }
    
    try {
      // Validate file
      if (options.fileName && options.fileSize && options.contentType) {
        storageService.validateFile(
          options.fileName,
          options.fileSize,
          options.contentType,
          options
        );
      }
      
      // Generate resumable upload URL for large files
      if (options.fileSize > 5 * 1024 * 1024) { // 5MB threshold
        return {
          uploadUrl: await storageService.generateResumableUploadUrl(filePath, options),
          type: 'resumable',
        };
      } else {
        return {
          uploadUrl: await storageService.generateSignedUrl(filePath, {
            action: 'write',
            expires: new Date(Date.now() + 15 * 60 * 1000),
            contentType: options.contentType,
          }),
          type: 'signed',
        };
      }
    } catch (error) {
      logger.error('Error in generateUploadUrl function:', error);
      throw error;
    }
  }
);

// Cloud Function to process uploaded images
export const processUploadedImage = onCall(
  { region: 'us-central1', memory: '512MiB' },
  async (request) => {
    const { filePath, variants } = request.data;
    
    if (!filePath) {
      throw new HttpsError('invalid-argument', 'File path is required');
    }
    
    try {
      const defaultVariants = [
        { suffix: 'thumb', options: { width: 150, height: 150, format: 'webp' as const } },
        { suffix: 'medium', options: { width: 500, height: 500, format: 'webp' as const } },
        { suffix: 'large', options: { width: 1200, height: 1200, format: 'webp' as const } },
      ];
      
      const variantsToGenerate = variants || defaultVariants;
      const generatedPaths = await storageService.generateImageVariants(
        filePath,
        variantsToGenerate
      );
      
      return { generatedPaths };
    } catch (error) {
      logger.error('Error in processUploadedImage function:', error);
      throw error;
    }
  }
);

// Trigger on file upload completion
export const onFileUploaded = onObjectFinalized(
  { region: 'us-central1', memory: '512MiB' },
  async (event) => {
    const filePath = event.data.name;
    const contentType = event.data.contentType;
    const userId = event.data.metadata?.['user-id'];
    const folder = event.data.metadata?.['folder'];
    
    if (!filePath || !userId) {
      logger.warn('Missing required metadata for file upload processing');
      return;
    }
    
    try {
      // Update user's file record
      await getFirestore().collection('userFiles').add({
        userId,
        filePath,
        folder,
        contentType,
        size: parseInt(event.data.size || '0'),
        uploadedAt: new Date(),
        status: 'uploaded',
      });
      
      // Auto-generate thumbnails for images
      if (contentType?.startsWith('image/') && folder !== 'thumbnails') {
        const thumbnailVariants = [
          { suffix: 'thumb', options: { width: 150, height: 150, format: 'webp' as const } },
          { suffix: 'medium', options: { width: 500, height: 500, format: 'webp' as const } },
        ];
        
        await storageService.generateImageVariants(filePath, thumbnailVariants);
        logger.info(`Auto-generated thumbnails for ${filePath}`);
      }
      
      logger.info(`Processed file upload: ${filePath}`);
    } catch (error) {
      logger.error('Error processing file upload:', error);
    }
  }
);

// Trigger on file deletion
export const onFileDeleted = onObjectDeleted(
  { region: 'us-central1' },
  async (event) => {
    const filePath = event.data.name;
    const userId = event.data.metadata?.['user-id'];
    
    if (!filePath || !userId) return;
    
    try {
      // Remove file record from database
      const fileQuery = await getFirestore()
        .collection('userFiles')
        .where('filePath', '==', filePath)
        .where('userId', '==', userId)
        .get();
      
      const batch = getFirestore().batch();
      fileQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      
      logger.info(`Removed file record for deleted file: ${filePath}`);
    } catch (error) {
      logger.error('Error processing file deletion:', error);
    }
  }
);

export { AdvancedStorageService, storageService };