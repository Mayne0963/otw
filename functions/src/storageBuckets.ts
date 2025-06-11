/**
 * Cloud Functions for Storage Bucket Management
 * Handles creation, configuration, and management of storage buckets
 * for orders, rewards, and analytics
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions';
import { storageBucketManager } from './services/storageBucketManager';
import { validateAdminRole, validateSystemRole } from './utils/auth';

// ========================================================================
// BUCKET MANAGEMENT FUNCTIONS
// ========================================================================

/**
 * Initialize all required storage buckets
 * This should be run once during deployment
 */
export const initializeStorageBuckets = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB'
  })
  .https.onCall(async (data, context) => {
    try {
      // Validate admin access
      validateAdminRole(context);

      logger.info('Initializing storage buckets...');
      
      await storageBucketManager.createAllBuckets();
      
      const summary = await storageBucketManager.getStorageUsageSummary();
      
      logger.info('Storage buckets initialized successfully', summary);
      
      return {
        success: true,
        message: 'Storage buckets initialized successfully',
        summary
      };
    } catch (error: any) {
      logger.error('Error initializing storage buckets:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to initialize storage buckets',
        error.message
      );
    }
  });

/**
 * Get storage usage summary across all buckets
 */
export const getStorageUsageSummary = functions
  .runWith({
    timeoutSeconds: 60,
    memory: '512MB'
  })
  .https.onCall(async (data, context) => {
    try {
      // Validate admin access
      validateAdminRole(context);

      const summary = await storageBucketManager.getStorageUsageSummary();
      
      return {
        success: true,
        data: summary
      };
    } catch (error: any) {
      logger.error('Error getting storage usage summary:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to get storage usage summary',
        error.message
      );
    }
  });

/**
 * Generate signed upload URL for specific bucket
 */
export const generateUploadUrl = functions
  .runWith({
    timeoutSeconds: 30,
    memory: '256MB'
  })
  .https.onCall(async (data, context) => {
    try {
      // Validate authentication
      if (!context.auth) {
        throw new functions.https.HttpsError(
          'unauthenticated',
          'User must be authenticated'
        );
      }

      const { bucketType, fileName, contentType, expiresIn = 3600 } = data;
      
      if (!bucketType || !fileName || !contentType) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'bucketType, fileName, and contentType are required'
        );
      }

      // Validate bucket type
      const validBucketTypes = ['orders', 'rewards', 'analytics'];
      if (!validBucketTypes.includes(bucketType)) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Invalid bucket type. Must be one of: orders, rewards, analytics'
        );
      }

      const projectId = process.env.GCLOUD_PROJECT;
      const bucketName = `${projectId}-${bucketType}`;
      
      // Add user ID and timestamp to filename for uniqueness
      const userId = context.auth.uid;
      const timestamp = Date.now();
      const uniqueFileName = `${userId}/${timestamp}-${fileName}`;
      
      const signedUrl = await storageBucketManager.generateSignedUploadUrl(
        bucketName,
        uniqueFileName,
        contentType,
        expiresIn
      );
      
      return {
        success: true,
        data: {
          uploadUrl: signedUrl,
          fileName: uniqueFileName,
          bucketName,
          expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
        }
      };
    } catch (error: any) {
      logger.error('Error generating upload URL:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to generate upload URL',
        error.message
      );
    }
  });

/**
 * Generate signed download URL for specific file
 */
export const generateDownloadUrl = functions
  .runWith({
    timeoutSeconds: 30,
    memory: '256MB'
  })
  .https.onCall(async (data, context) => {
    try {
      // Validate authentication
      if (!context.auth) {
        throw new functions.https.HttpsError(
          'unauthenticated',
          'User must be authenticated'
        );
      }

      const { bucketType, fileName, expiresIn = 3600 } = data;
      
      if (!bucketType || !fileName) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'bucketType and fileName are required'
        );
      }

      const projectId = process.env.GCLOUD_PROJECT;
      const bucketName = `${projectId}-${bucketType}`;
      
      // Validate user has access to this file
      const userId = context.auth.uid;
      const userRole = context.auth.token.role || 'user';
      
      // Check if user owns the file or has admin access
      if (!fileName.startsWith(userId) && !['admin', 'customer_service'].includes(userRole)) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'You do not have permission to access this file'
        );
      }
      
      const signedUrl = await storageBucketManager.generateSignedDownloadUrl(
        bucketName,
        fileName,
        expiresIn
      );
      
      return {
        success: true,
        data: {
          downloadUrl: signedUrl,
          fileName,
          bucketName,
          expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
        }
      };
    } catch (error: any) {
      logger.error('Error generating download URL:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to generate download URL',
        error.message
      );
    }
  });

// ========================================================================
// MAINTENANCE FUNCTIONS
// ========================================================================

/**
 * Clean up old files from storage buckets
 * Scheduled to run daily
 */
export const cleanupOldFiles = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB'
  })
  .pubsub.schedule('0 2 * * *') // Run at 2 AM daily
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      logger.info('Starting scheduled cleanup of old files...');
      
      const projectId = process.env.GCLOUD_PROJECT;
      const cleanupTasks = [
        // Clean up temp files older than 1 day
        storageBucketManager.cleanupOldFiles(`${projectId}-orders`, 1),
        storageBucketManager.cleanupOldFiles(`${projectId}-rewards`, 1),
        storageBucketManager.cleanupOldFiles(`${projectId}-analytics`, 7),
      ];
      
      const results = await Promise.allSettled(cleanupTasks);
      
      let totalDeleted = 0;
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          totalDeleted += result.value;
        } else {
          logger.error(`Cleanup failed for bucket ${index}:`, result.reason);
        }
      });
      
      logger.info(`Cleanup completed. Total files deleted: ${totalDeleted}`);
      
      // Log storage usage after cleanup
      const summary = await storageBucketManager.getStorageUsageSummary();
      logger.info('Storage usage after cleanup:', summary);
      
    } catch (error) {
      logger.error('Error during scheduled cleanup:', error);
    }
  });

/**
 * Manual cleanup function for admins
 */
export const manualCleanup = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB'
  })
  .https.onCall(async (data, context) => {
    try {
      // Validate admin access
      validateAdminRole(context);

      const { bucketType, maxAge = 30 } = data;
      
      if (!bucketType) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'bucketType is required'
        );
      }

      const projectId = process.env.GCLOUD_PROJECT;
      const bucketName = `${projectId}-${bucketType}`;
      
      const deletedCount = await storageBucketManager.cleanupOldFiles(bucketName, maxAge);
      
      return {
        success: true,
        message: `Cleanup completed for ${bucketName}`,
        deletedCount
      };
    } catch (error: any) {
      logger.error('Error during manual cleanup:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to perform cleanup',
        error.message
      );
    }
  });

// ========================================================================
// FILE MANAGEMENT FUNCTIONS
// ========================================================================

/**
 * Copy file between buckets
 */
export const copyFileBetweenBuckets = functions
  .runWith({
    timeoutSeconds: 300,
    memory: '512MB'
  })
  .https.onCall(async (data, context) => {
    try {
      // Validate admin access
      validateAdminRole(context);

      const { sourceBucket, sourceFile, destinationBucket, destinationFile } = data;
      
      if (!sourceBucket || !sourceFile || !destinationBucket || !destinationFile) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'All parameters are required: sourceBucket, sourceFile, destinationBucket, destinationFile'
        );
      }

      const projectId = process.env.GCLOUD_PROJECT;
      const sourceBucketName = `${projectId}-${sourceBucket}`;
      const destinationBucketName = `${projectId}-${destinationBucket}`;
      
      await storageBucketManager.copyFileBetweenBuckets(
        sourceBucketName,
        sourceFile,
        destinationBucketName,
        destinationFile
      );
      
      return {
        success: true,
        message: 'File copied successfully',
        source: `${sourceBucketName}/${sourceFile}`,
        destination: `${destinationBucketName}/${destinationFile}`
      };
    } catch (error: any) {
      logger.error('Error copying file between buckets:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to copy file',
        error.message
      );
    }
  });

// ========================================================================
// MONITORING FUNCTIONS
// ========================================================================

/**
 * Monitor storage usage and send alerts
 * Scheduled to run every 6 hours
 */
export const monitorStorageUsage = functions
  .runWith({
    timeoutSeconds: 60,
    memory: '256MB'
  })
  .pubsub.schedule('0 */6 * * *') // Run every 6 hours
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      logger.info('Monitoring storage usage...');
      
      const summary = await storageBucketManager.getStorageUsageSummary();
      
      // Convert bytes to GB for easier reading
      const totalSizeGB = summary.totalSize / (1024 * 1024 * 1024);
      
      logger.info(`Total storage usage: ${totalSizeGB.toFixed(2)} GB across ${summary.bucketCount} buckets`);
      
      // Alert if storage usage exceeds thresholds
      const warningThresholdGB = 50; // 50 GB warning
      const criticalThresholdGB = 100; // 100 GB critical
      
      if (totalSizeGB > criticalThresholdGB) {
        logger.warn(`CRITICAL: Storage usage (${totalSizeGB.toFixed(2)} GB) exceeds critical threshold (${criticalThresholdGB} GB)`);
        // Here you could send notifications to admins
      } else if (totalSizeGB > warningThresholdGB) {
        logger.warn(`WARNING: Storage usage (${totalSizeGB.toFixed(2)} GB) exceeds warning threshold (${warningThresholdGB} GB)`);
      }
      
      // Log individual bucket usage
      summary.buckets.forEach(bucket => {
        const bucketSizeGB = bucket.totalSize / (1024 * 1024 * 1024);
        logger.info(`Bucket ${bucket.bucketName}: ${bucketSizeGB.toFixed(2)} GB, ${bucket.objectCount} objects`);
      });
      
    } catch (error) {
      logger.error('Error monitoring storage usage:', error);
    }
  });

// ========================================================================
// BUCKET LIFECYCLE TRIGGERS
// ========================================================================

/**
 * Handle file uploads to orders bucket
 */
export const onOrderFileUploaded = functions.storage
  .bucket('ezyzip-orders')
  .object()
  .onFinalize(async (object) => {
    try {
      logger.info(`File uploaded to orders bucket: ${object.name}`);
      
      // Extract metadata
      const filePath = object.name || '';
      const contentType = object.contentType || '';
      const size = parseInt(object.size || '0');
      
      // Log upload event
      await admin.firestore().collection('storage_events').add({
        type: 'file_uploaded',
        bucket: 'orders',
        filePath,
        contentType,
        size,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
          generation: object.generation,
          timeCreated: object.timeCreated
        }
      });
      
      logger.info(`Logged upload event for: ${filePath}`);
    } catch (error) {
      logger.error('Error handling order file upload:', error);
    }
  });

/**
 * Handle file uploads to rewards bucket
 */
export const onRewardFileUploaded = functions.storage
  .bucket('ezyzip-rewards')
  .object()
  .onFinalize(async (object) => {
    try {
      logger.info(`File uploaded to rewards bucket: ${object.name}`);
      
      const filePath = object.name || '';
      const contentType = object.contentType || '';
      const size = parseInt(object.size || '0');
      
      // Log upload event
      await admin.firestore().collection('storage_events').add({
        type: 'file_uploaded',
        bucket: 'rewards',
        filePath,
        contentType,
        size,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
          generation: object.generation,
          timeCreated: object.timeCreated
        }
      });
      
    } catch (error) {
      logger.error('Error handling reward file upload:', error);
    }
  });

/**
 * Handle file uploads to analytics bucket
 */
export const onAnalyticsFileUploaded = functions.storage
  .bucket('ezyzip-analytics')
  .object()
  .onFinalize(async (object) => {
    try {
      logger.info(`File uploaded to analytics bucket: ${object.name}`);
      
      const filePath = object.name || '';
      const contentType = object.contentType || '';
      const size = parseInt(object.size || '0');
      
      // Log upload event
      await admin.firestore().collection('storage_events').add({
        type: 'file_uploaded',
        bucket: 'analytics',
        filePath,
        contentType,
        size,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
          generation: object.generation,
          timeCreated: object.timeCreated
        }
      });
      
    } catch (error) {
      logger.error('Error handling analytics file upload:', error);
    }
  });