import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import { orderProcessing } from './triggers/orderProcessing';
import { userManagement } from './triggers/userManagement';
import { notificationService } from './services/notificationService';
import { webhookHandlers } from './webhooks/stripeWebhooks';
import { imageProcessing } from './triggers/imageProcessing';
import { analyticsService } from './services/analyticsService';
import { backupService } from './services/backupService';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// Express app for HTTP functions
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Export HTTP functions
exports.api = onRequest(app);

// Order Processing Functions
exports.processOrder = orderProcessing.processOrder;
exports.updateOrderStatus = orderProcessing.updateOrderStatus;
exports.calculateOrderMetrics = orderProcessing.calculateOrderMetrics;
exports.onOrderCreated = orderProcessing.onOrderCreated;
exports.onOrderUpdated = orderProcessing.onOrderUpdated;

// User Management Functions
exports.onUserCreated = userManagement.onUserCreated;
exports.onUserDeleted = userManagement.onUserDeleted;
exports.updateUserProfile = userManagement.updateUserProfile;
exports.getUserAnalytics = userManagement.getUserAnalytics;

// Notification Functions
exports.sendOrderNotification = notificationService.sendOrderNotification;
exports.sendWelcomeEmail = notificationService.sendWelcomeEmail;
exports.sendPasswordResetEmail = notificationService.sendPasswordResetEmail;
exports.sendPromotionalEmail = notificationService.sendPromotionalEmail;

// Webhook Functions
exports.stripeWebhook = webhookHandlers.stripeWebhook;
exports.paymentWebhook = webhookHandlers.paymentWebhook;

// Image Processing Functions
exports.processUploadedImage = imageProcessing.processUploadedImage;
exports.generateThumbnails = imageProcessing.generateThumbnails;
exports.optimizeImages = imageProcessing.optimizeImages;

// Analytics Functions
exports.trackUserEvent = analyticsService.trackUserEvent;
exports.generateDailyReport = analyticsService.generateDailyReport;
exports.calculateBusinessMetrics = analyticsService.calculateBusinessMetrics;

// Backup and Maintenance Functions
exports.dailyBackup = backupService.dailyBackup;
exports.cleanupOldData = backupService.cleanupOldData;
exports.syncExternalData = backupService.syncExternalData;

// Scheduled Functions (already defined in their respective services)
exports.scheduledBackup = backupService.dailyBackup;
exports.dailyAnalytics = analyticsService.generateDailyReport;
exports.weeklyCleanup = backupService.cleanupOldData;

// Blaze Plan Features
exports.processExternalApiCall = require('./services/blazePlanFeatures').processExternalApiCall;
exports.analyzeImageWithVision = require('./services/blazePlanFeatures').analyzeImageWithVision;
exports.getSecretValue = require('./services/blazePlanFeatures').getSecretValue;
exports.processHighVolumeData = require('./services/blazePlanFeatures').processHighVolumeData;
exports.sendBulkEmails = require('./services/blazePlanFeatures').sendBulkEmails;
exports.generateAdvancedReport = require('./services/blazePlanFeatures').generateAdvancedReport;
exports.syncWithThirdPartyService = require('./services/blazePlanFeatures').syncWithThirdPartyService;
exports.processWebhookData = require('./services/blazePlanFeatures').processWebhookData;
exports.handlePaymentWebhook = require('./services/blazePlanFeatures').handlePaymentWebhook;
exports.scheduledDataProcessing = require('./services/blazePlanFeatures').scheduledDataProcessing;

// Cloud Messaging
exports.sendNotification = require('./services/cloudMessaging').sendNotification;
exports.manageTopicSubscriptions = require('./services/cloudMessaging').manageTopicSubscriptions;
exports.onOrderStatusChange = require('./services/cloudMessaging').onOrderStatusChange;
exports.sendPromotionalNotifications = require('./services/cloudMessaging').sendPromotionalNotifications;

// Advanced Storage
exports.generateUploadUrl = require('./services/advancedStorage').generateUploadUrl;
exports.processAdvancedImage = require('./services/advancedStorage').processUploadedImage;
exports.onFileUploaded = require('./services/advancedStorage').onFileUploaded;
exports.onFileDeleted = require('./services/advancedStorage').onFileDeleted;