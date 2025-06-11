/**
 * Storage Bucket Manager Service
 * Manages creation and configuration of Firebase Storage buckets
 * for orders, rewards, and analytics data
 */

import { Storage } from '@google-cloud/storage';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { logger } from 'firebase-functions';

interface BucketConfig {
  name: string;
  location: string;
  storageClass: string;
  uniformBucketLevelAccess: boolean;
  publicAccessPrevention: string;
  lifecycleRules: any[];
  corsConfiguration: any[];
  labels: Record<string, string>;
}

interface BucketMetrics {
  bucketName: string;
  totalSize: number;
  objectCount: number;
  lastModified: Date;
  storageClass: string;
}

export class StorageBucketManager {
  private storage: Storage;
  private projectId: string;

  constructor() {
    this.storage = new Storage();
    this.projectId = process.env.GCLOUD_PROJECT || '';
  }

  /**
   * Get configuration for all required buckets
   */
  private getBucketConfigurations(): BucketConfig[] {
    const baseLocation = 'us-central1';
    const baseLabels = {
      project: 'ezyzip',
      environment: process.env.NODE_ENV || 'development',
      managed_by: 'cloud_functions'
    };

    return [
      {
        name: `${this.projectId}-orders`,
        location: baseLocation,
        storageClass: 'STANDARD',
        uniformBucketLevelAccess: true,
        publicAccessPrevention: 'enforced',
        labels: { ...baseLabels, purpose: 'orders' },
        corsConfiguration: [
          {
            origin: ['*'],
            method: ['GET', 'POST', 'PUT', 'DELETE'],
            responseHeader: ['Content-Type', 'Authorization'],
            maxAgeSeconds: 3600
          }
        ],
        lifecycleRules: [
          {
            condition: {
              age: 2555, // 7 years for legal compliance
              matchesStorageClass: ['STANDARD']
            },
            action: {
              type: 'SetStorageClass',
              storageClass: 'ARCHIVE'
            }
          },
          {
            condition: {
              age: 3650, // 10 years
              matchesStorageClass: ['ARCHIVE']
            },
            action: {
              type: 'Delete'
            }
          }
        ]
      },
      {
        name: `${this.projectId}-rewards`,
        location: baseLocation,
        storageClass: 'STANDARD',
        uniformBucketLevelAccess: true,
        publicAccessPrevention: 'enforced',
        labels: { ...baseLabels, purpose: 'rewards' },
        corsConfiguration: [
          {
            origin: ['*'],
            method: ['GET', 'POST', 'PUT'],
            responseHeader: ['Content-Type', 'Authorization'],
            maxAgeSeconds: 3600
          }
        ],
        lifecycleRules: [
          {
            condition: {
              age: 365, // 1 year for promotional materials
              matchesPrefix: ['promotional-banners/', 'campaign-assets/']
            },
            action: {
              type: 'SetStorageClass',
              storageClass: 'NEARLINE'
            }
          },
          {
            condition: {
              age: 1095, // 3 years
              matchesStorageClass: ['NEARLINE']
            },
            action: {
              type: 'SetStorageClass',
              storageClass: 'COLDLINE'
            }
          },
          {
            condition: {
              age: 1, // 1 day for temp files
              matchesPrefix: ['temp-rewards/']
            },
            action: {
              type: 'Delete'
            }
          }
        ]
      },
      {
        name: `${this.projectId}-analytics`,
        location: baseLocation,
        storageClass: 'STANDARD',
        uniformBucketLevelAccess: true,
        publicAccessPrevention: 'enforced',
        labels: { ...baseLabels, purpose: 'analytics' },
        corsConfiguration: [
          {
            origin: ['*'],
            method: ['GET', 'POST'],
            responseHeader: ['Content-Type', 'Authorization'],
            maxAgeSeconds: 3600
          }
        ],
        lifecycleRules: [
          {
            condition: {
              age: 30, // 30 days for raw data
              matchesPrefix: ['raw-data/']
            },
            action: {
              type: 'SetStorageClass',
              storageClass: 'NEARLINE'
            }
          },
          {
            condition: {
              age: 90, // 90 days
              matchesStorageClass: ['NEARLINE']
            },
            action: {
              type: 'SetStorageClass',
              storageClass: 'COLDLINE'
            }
          },
          {
            condition: {
              age: 365, // 1 year
              matchesStorageClass: ['COLDLINE']
            },
            action: {
              type: 'SetStorageClass',
              storageClass: 'ARCHIVE'
            }
          },
          {
            condition: {
              age: 7, // 7 days for temp analytics
              matchesPrefix: ['temp-analytics/']
            },
            action: {
              type: 'Delete'
            }
          },
          {
            condition: {
              age: 30, // 30 days for data exports
              matchesPrefix: ['data-exports/']
            },
            action: {
              type: 'Delete'
            }
          }
        ]
      }
    ];
  }

  /**
   * Create a storage bucket with the specified configuration
   */
  async createBucket(config: BucketConfig): Promise<void> {
    try {
      const [bucket] = await this.storage.createBucket(config.name, {
        location: config.location,
        storageClass: config.storageClass,
        uniformBucketLevelAccess: config.uniformBucketLevelAccess,
        publicAccessPrevention: config.publicAccessPrevention,
        labels: config.labels
      });

      // Set lifecycle rules
      if (config.lifecycleRules.length > 0) {
        await bucket.setMetadata({
          lifecycle: {
            rule: config.lifecycleRules
          }
        });
      }

      // Set CORS configuration
      if (config.corsConfiguration.length > 0) {
        await bucket.setCorsConfiguration(config.corsConfiguration);
      }

      logger.info(`Successfully created bucket: ${config.name}`);
    } catch (error: any) {
      if (error.code === 409) {
        logger.info(`Bucket ${config.name} already exists, updating configuration...`);
        await this.updateBucketConfiguration(config);
      } else {
        logger.error(`Error creating bucket ${config.name}:`, error);
        throw error;
      }
    }
  }

  /**
   * Update existing bucket configuration
   */
  async updateBucketConfiguration(config: BucketConfig): Promise<void> {
    try {
      const bucket = this.storage.bucket(config.name);

      // Update metadata
      await bucket.setMetadata({
        labels: config.labels,
        lifecycle: {
          rule: config.lifecycleRules
        }
      });

      // Update CORS configuration
      if (config.corsConfiguration.length > 0) {
        await bucket.setCorsConfiguration(config.corsConfiguration);
      }

      logger.info(`Successfully updated bucket configuration: ${config.name}`);
    } catch (error) {
      logger.error(`Error updating bucket ${config.name}:`, error);
      throw error;
    }
  }

  /**
   * Create all required storage buckets
   */
  async createAllBuckets(): Promise<void> {
    const configs = this.getBucketConfigurations();
    
    for (const config of configs) {
      await this.createBucket(config);
    }

    logger.info('All storage buckets created/updated successfully');
  }

  /**
   * Check if a bucket exists
   */
  async bucketExists(bucketName: string): Promise<boolean> {
    try {
      const [exists] = await this.storage.bucket(bucketName).exists();
      return exists;
    } catch (error) {
      logger.error(`Error checking bucket existence ${bucketName}:`, error);
      return false;
    }
  }

  /**
   * Get bucket metrics and information
   */
  async getBucketMetrics(bucketName: string): Promise<BucketMetrics | null> {
    try {
      const bucket = this.storage.bucket(bucketName);
      const [metadata] = await bucket.getMetadata();
      const [files] = await bucket.getFiles();

      let totalSize = 0;
      let lastModified = new Date(0);

      for (const file of files) {
        const [fileMetadata] = await file.getMetadata();
        totalSize += parseInt(fileMetadata.size || '0');
        
        const fileModified = new Date(fileMetadata.updated || 0);
        if (fileModified > lastModified) {
          lastModified = fileModified;
        }
      }

      return {
        bucketName,
        totalSize,
        objectCount: files.length,
        lastModified,
        storageClass: metadata.storageClass || 'STANDARD'
      };
    } catch (error) {
      logger.error(`Error getting bucket metrics for ${bucketName}:`, error);
      return null;
    }
  }

  /**
   * Clean up old files based on lifecycle rules
   */
  async cleanupOldFiles(bucketName: string, maxAge: number): Promise<number> {
    try {
      const bucket = this.storage.bucket(bucketName);
      const [files] = await bucket.getFiles();
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAge);
      
      let deletedCount = 0;
      
      for (const file of files) {
        const [metadata] = await file.getMetadata();
        const fileDate = new Date(metadata.timeCreated || 0);
        
        if (fileDate < cutoffDate) {
          await file.delete();
          deletedCount++;
          logger.info(`Deleted old file: ${file.name}`);
        }
      }
      
      logger.info(`Cleaned up ${deletedCount} old files from ${bucketName}`);
      return deletedCount;
    } catch (error) {
      logger.error(`Error cleaning up old files in ${bucketName}:`, error);
      throw error;
    }
  }

  /**
   * Generate signed URL for file upload
   */
  async generateSignedUploadUrl(
    bucketName: string,
    fileName: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const bucket = this.storage.bucket(bucketName);
      const file = bucket.file(fileName);

      const [signedUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + expiresIn * 1000,
        contentType
      });

      return signedUrl;
    } catch (error) {
      logger.error(`Error generating signed upload URL:`, error);
      throw error;
    }
  }

  /**
   * Generate signed URL for file download
   */
  async generateSignedDownloadUrl(
    bucketName: string,
    fileName: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const bucket = this.storage.bucket(bucketName);
      const file = bucket.file(fileName);

      const [signedUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + expiresIn * 1000
      });

      return signedUrl;
    } catch (error) {
      logger.error(`Error generating signed download URL:`, error);
      throw error;
    }
  }

  /**
   * Copy file between buckets
   */
  async copyFileBetweenBuckets(
    sourceBucket: string,
    sourceFile: string,
    destinationBucket: string,
    destinationFile: string
  ): Promise<void> {
    try {
      const source = this.storage.bucket(sourceBucket).file(sourceFile);
      const destination = this.storage.bucket(destinationBucket).file(destinationFile);

      await source.copy(destination);
      logger.info(`Copied file from ${sourceBucket}/${sourceFile} to ${destinationBucket}/${destinationFile}`);
    } catch (error) {
      logger.error(`Error copying file between buckets:`, error);
      throw error;
    }
  }

  /**
   * Get storage usage summary across all buckets
   */
  async getStorageUsageSummary(): Promise<{
    totalSize: number;
    bucketCount: number;
    buckets: BucketMetrics[];
  }> {
    const configs = this.getBucketConfigurations();
    const buckets: BucketMetrics[] = [];
    let totalSize = 0;

    for (const config of configs) {
      const metrics = await this.getBucketMetrics(config.name);
      if (metrics) {
        buckets.push(metrics);
        totalSize += metrics.totalSize;
      }
    }

    return {
      totalSize,
      bucketCount: buckets.length,
      buckets
    };
  }
}

// Export singleton instance
export const storageBucketManager = new StorageBucketManager();