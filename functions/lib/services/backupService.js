"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupService = exports.createManualBackup = exports.syncExternalData = exports.cleanupOldData = exports.dailyBackup = void 0;
const functions = __importStar(require("firebase-functions"));
const functionsV2 = __importStar(require("firebase-functions/v2"));
const admin = __importStar(require("firebase-admin"));
const storage_1 = require("@google-cloud/storage");
const db = admin.firestore();
const storage = new storage_1.Storage();
/**
 * Daily backup function - runs every day at 2 AM
 */
exports.dailyBackup = functionsV2.scheduler.onSchedule('0 2 * * *', async (event) => {
    const timestamp = new Date().toISOString();
    const backupId = `backup-${timestamp.split('T')[0]}-${Date.now()}`;
    try {
        console.log(`Starting daily backup: ${backupId}`);
        // Backup critical collections
        const collections = ['users', 'orders', 'restaurants', 'analytics_events', 'subscriptions'];
        const backupResults = [];
        for (const collectionName of collections) {
            const result = await backupCollection(collectionName, backupId);
            backupResults.push(result);
        }
        // Create backup metadata
        const backupMetadata = {
            backupId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            collections: backupResults,
            status: 'completed',
            type: 'daily_scheduled',
        };
        await db.collection('backup_logs').doc(backupId).set(backupMetadata);
        console.log(`Daily backup completed: ${backupId}`);
        // Scheduled functions should not return values
    }
    catch (error) {
        console.error('Daily backup failed:', error);
        // Log backup failure
        await db.collection('backup_logs').doc(backupId).set({
            backupId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            status: 'failed',
            error: error instanceof Error ? error.message : String(error),
            type: 'daily_scheduled',
        });
        throw error;
    }
});
/**
 * Clean up old data - runs weekly on Sundays at 3 AM
 */
exports.cleanupOldData = functionsV2.scheduler.onSchedule({
    schedule: '0 3 * * 0',
    timeZone: 'America/New_York'
}, async (event) => {
    try {
        console.log('Starting weekly data cleanup');
        const cleanupResults = [];
        // Clean up old analytics events (older than 90 days)
        const analyticsResult = await cleanupOldAnalyticsEvents();
        cleanupResults.push(analyticsResult);
        // Clean up old backup logs (older than 30 days)
        const backupLogsResult = await cleanupOldBackupLogs();
        cleanupResults.push(backupLogsResult);
        // Clean up old notification logs (older than 60 days)
        const notificationLogsResult = await cleanupOldNotificationLogs();
        cleanupResults.push(notificationLogsResult);
        // Clean up orphaned files in Storage
        const storageResult = await cleanupOrphanedFiles();
        cleanupResults.push(storageResult);
        // Log cleanup results
        await db.collection('cleanup_logs').add({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            results: cleanupResults,
            status: 'completed',
            type: 'weekly_scheduled',
        });
        console.log('Weekly data cleanup completed');
        // Scheduled functions should not return values
    }
    catch (error) {
        console.error('Weekly cleanup failed:', error);
        await db.collection('cleanup_logs').add({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            status: 'failed',
            error: error instanceof Error ? error.message : String(error),
            type: 'weekly_scheduled',
        });
        throw error;
    }
});
/**
 * Sync external data - runs daily at 4 AM
 */
exports.syncExternalData = functions.pubsub.schedule('0 4 * * *')
    .timeZone('America/New_York')
    .onRun(async (context) => {
    try {
        console.log('Starting external data sync');
        const syncResults = [];
        // Sync restaurant data from external APIs
        const restaurantSyncResult = await syncRestaurantData();
        syncResults.push(restaurantSyncResult);
        // Sync payment data from Stripe
        const paymentSyncResult = await syncPaymentData();
        syncResults.push(paymentSyncResult);
        // Update analytics aggregates
        const analyticsUpdateResult = await updateAnalyticsAggregates();
        syncResults.push(analyticsUpdateResult);
        // Log sync results
        await db.collection('sync_logs').add({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            results: syncResults,
            status: 'completed',
            type: 'daily_scheduled',
        });
        console.log('External data sync completed');
        return { success: true, results: syncResults };
    }
    catch (error) {
        console.error('External data sync failed:', error);
        await db.collection('sync_logs').add({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            status: 'failed',
            error: error instanceof Error ? error.message : String(error),
            type: 'daily_scheduled',
        });
        throw error;
    }
});
/**
 * Manual backup function
 */
exports.createManualBackup = functionsV2.https.onCall(async (request) => {
    // Verify user is authenticated and has admin role
    if (!request.auth) {
        throw new functionsV2.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userDoc = await db.collection('users').doc(request.auth.uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
        throw new functionsV2.https.HttpsError('permission-denied', 'Admin access required');
    }
    const { data } = request;
    const timestamp = new Date().toISOString();
    const backupId = `manual-backup-${timestamp.split('T')[0]}-${Date.now()}`;
    const collectionsToBackup = data.collections || ['users', 'orders', 'restaurants'];
    try {
        console.log(`Starting manual backup: ${backupId}`);
        const backupResults = [];
        for (const collectionName of collectionsToBackup) {
            const result = await backupCollection(collectionName, backupId);
            backupResults.push(result);
        }
        const backupMetadata = {
            backupId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            collections: backupResults,
            status: 'completed',
            type: 'manual',
            initiatedBy: request.auth.uid,
        };
        await db.collection('backup_logs').doc(backupId).set(backupMetadata);
        return { success: true, backupId, collections: backupResults };
    }
    catch (error) {
        console.error('Manual backup failed:', error);
        throw new functionsV2.https.HttpsError('internal', `Backup failed: ${error.message}`);
    }
});
/**
 * Backup a specific collection
 */
async function backupCollection(collectionName, backupId) {
    try {
        const snapshot = await db.collection(collectionName).get();
        const documents = [];
        snapshot.forEach((doc) => {
            documents.push({
                id: doc.id,
                data: doc.data(),
            });
        });
        // Store backup in Cloud Storage
        const bucketName = process.env.FIREBASE_STORAGE_BUCKET || 'default-bucket';
        const bucket = storage.bucket(bucketName);
        const fileName = `backups/${backupId}/${collectionName}.json`;
        const file = bucket.file(fileName);
        await file.save(JSON.stringify(documents, null, 2), {
            metadata: {
                contentType: 'application/json',
                metadata: {
                    backupId,
                    collection: collectionName,
                    documentCount: documents.length.toString(),
                    createdAt: new Date().toISOString(),
                },
            },
        });
        console.log(`Backed up ${documents.length} documents from ${collectionName}`);
        return {
            collection: collectionName,
            documentCount: documents.length,
            fileName,
            status: 'success',
        };
    }
    catch (error) {
        console.error(`Error backing up collection ${collectionName}:`, error);
        return {
            collection: collectionName,
            status: 'failed',
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
/**
 * Clean up old analytics events
 */
async function cleanupOldAnalyticsEvents() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days ago
    const oldEventsQuery = db.collection('analytics_events')
        .where('timestamp', '<', cutoffDate)
        .limit(500); // Process in batches
    const snapshot = await oldEventsQuery.get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
    return {
        type: 'analytics_events_cleanup',
        deletedCount: snapshot.size,
        cutoffDate: cutoffDate.toISOString(),
    };
}
/**
 * Clean up old backup logs
 */
async function cleanupOldBackupLogs() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago
    const oldLogsQuery = db.collection('backup_logs')
        .where('timestamp', '<', cutoffDate)
        .limit(100);
    const snapshot = await oldLogsQuery.get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
    return {
        type: 'backup_logs_cleanup',
        deletedCount: snapshot.size,
        cutoffDate: cutoffDate.toISOString(),
    };
}
/**
 * Clean up old notification logs
 */
async function cleanupOldNotificationLogs() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 60); // 60 days ago
    const oldLogsQuery = db.collection('notification_logs')
        .where('timestamp', '<', cutoffDate)
        .limit(500);
    const snapshot = await oldLogsQuery.get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
    return {
        type: 'notification_logs_cleanup',
        deletedCount: snapshot.size,
        cutoffDate: cutoffDate.toISOString(),
    };
}
/**
 * Clean up orphaned files in Storage
 */
async function cleanupOrphanedFiles() {
    // This is a simplified version - in production, you'd want more sophisticated logic
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || 'default-bucket';
    const bucket = storage.bucket(bucketName);
    // Get files older than 30 days in temp directories
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    const [files] = await bucket.getFiles({
        prefix: 'temp/',
    });
    let deletedCount = 0;
    for (const file of files) {
        const [metadata] = await file.getMetadata();
        const fileDate = new Date(metadata.timeCreated || 0);
        if (fileDate < cutoffDate) {
            await file.delete();
            deletedCount++;
        }
    }
    return {
        type: 'storage_cleanup',
        deletedCount,
        cutoffDate: cutoffDate.toISOString(),
    };
}
/**
 * Sync restaurant data from external APIs
 */
async function syncRestaurantData() {
    // Placeholder for external API sync
    // In a real implementation, you'd fetch data from external restaurant APIs
    return {
        type: 'restaurant_data_sync',
        status: 'completed',
        message: 'Restaurant data sync placeholder - implement external API calls',
    };
}
/**
 * Sync payment data from Stripe
 */
async function syncPaymentData() {
    // Placeholder for Stripe data sync
    // In a real implementation, you'd sync recent payments, refunds, etc.
    return {
        type: 'payment_data_sync',
        status: 'completed',
        message: 'Payment data sync placeholder - implement Stripe API calls',
    };
}
/**
 * Update analytics aggregates
 */
async function updateAnalyticsAggregates() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    // Update daily aggregates for yesterday
    const startOfDay = new Date(yesterday);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(yesterday);
    endOfDay.setHours(23, 59, 59, 999);
    const eventsSnapshot = await db.collection('analytics_events')
        .where('timestamp', '>=', startOfDay)
        .where('timestamp', '<=', endOfDay)
        .get();
    const aggregateData = {
        date: yesterday.toISOString().split('T')[0],
        totalEvents: eventsSnapshot.size,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection('daily_aggregates').doc(aggregateData.date).set(aggregateData);
    return {
        type: 'analytics_aggregates_update',
        date: aggregateData.date,
        totalEvents: aggregateData.totalEvents,
    };
}
exports.backupService = {
    dailyBackup: exports.dailyBackup,
    cleanupOldData: exports.cleanupOldData,
    syncExternalData: exports.syncExternalData,
    createManualBackup: exports.createManualBackup,
};
//# sourceMappingURL=backupService.js.map