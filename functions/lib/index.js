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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const orderProcessing_1 = require("./triggers/orderProcessing");
const userManagement_1 = require("./triggers/userManagement");
const notificationService_1 = require("./services/notificationService");
const stripeWebhooks_1 = require("./webhooks/stripeWebhooks");
const imageProcessing_1 = require("./triggers/imageProcessing");
const analyticsService_1 = require("./services/analyticsService");
const backupService_1 = require("./services/backupService");
// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}
// Express app for HTTP functions
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});
// Export HTTP functions
exports.api = (0, https_1.onRequest)(app);
// Order Processing Functions
exports.processOrder = orderProcessing_1.orderProcessing.processOrder;
exports.updateOrderStatus = orderProcessing_1.orderProcessing.updateOrderStatus;
exports.calculateOrderMetrics = orderProcessing_1.orderProcessing.calculateOrderMetrics;
exports.onOrderCreated = orderProcessing_1.orderProcessing.onOrderCreated;
exports.onOrderUpdated = orderProcessing_1.orderProcessing.onOrderUpdated;
// User Management Functions
exports.onUserCreated = userManagement_1.userManagement.onUserCreated;
exports.onUserDeleted = userManagement_1.userManagement.onUserDeleted;
exports.updateUserProfile = userManagement_1.userManagement.updateUserProfile;
exports.getUserAnalytics = userManagement_1.userManagement.getUserAnalytics;
// Notification Functions
exports.sendOrderNotification = notificationService_1.notificationService.sendOrderNotification;
exports.sendWelcomeEmail = notificationService_1.notificationService.sendWelcomeEmail;
exports.sendPasswordResetEmail = notificationService_1.notificationService.sendPasswordResetEmail;
exports.sendPromotionalEmail = notificationService_1.notificationService.sendPromotionalEmail;
// Webhook Functions
exports.stripeWebhook = stripeWebhooks_1.webhookHandlers.stripeWebhook;
exports.paymentWebhook = stripeWebhooks_1.webhookHandlers.paymentWebhook;
// Image Processing Functions
exports.processUploadedImage = imageProcessing_1.imageProcessing.processUploadedImage;
exports.generateThumbnails = imageProcessing_1.imageProcessing.generateThumbnails;
exports.optimizeImages = imageProcessing_1.imageProcessing.optimizeImages;
// Analytics Functions
exports.trackUserEvent = analyticsService_1.analyticsService.trackUserEvent;
exports.generateDailyReport = analyticsService_1.analyticsService.generateDailyReport;
exports.calculateBusinessMetrics = analyticsService_1.analyticsService.calculateBusinessMetrics;
// Backup and Maintenance Functions
exports.dailyBackup = backupService_1.backupService.dailyBackup;
exports.cleanupOldData = backupService_1.backupService.cleanupOldData;
exports.syncExternalData = backupService_1.backupService.syncExternalData;
// Scheduled Functions (already defined in their respective services)
exports.scheduledBackup = backupService_1.backupService.dailyBackup;
exports.dailyAnalytics = analyticsService_1.analyticsService.generateDailyReport;
exports.weeklyCleanup = backupService_1.backupService.cleanupOldData;
//# sourceMappingURL=index.js.map