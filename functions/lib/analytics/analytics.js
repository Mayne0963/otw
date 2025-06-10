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
exports.analyticsHandlers = exports.cleanupOldAnalytics = exports.trackPageView = exports.getAdminAnalytics = exports.generateDailyReport = exports.getUserAnalytics = exports.trackEvent = void 0;
const functionsV2 = __importStar(require("firebase-functions/v2"));
const admin = __importStar(require("firebase-admin"));
const firebase_functions_1 = require("firebase-functions");
const db = admin.firestore();
/**
 * Track user events
 */
exports.trackEvent = functionsV2.https.onCall(async (request) => {
    if (!request.auth) {
        throw new functionsV2.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { data } = request;
    const { eventName, properties } = data;
    const userId = request.auth.uid;
    try {
        await db.collection('analytics_events').add({
            userId,
            eventName,
            properties: properties || {},
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            userAgent: request.rawRequest.headers['user-agent'],
            ip: request.rawRequest.ip,
        });
        firebase_functions_1.logger.info(`Event tracked: ${eventName} for user ${userId}`);
        return { success: true };
    }
    catch (error) {
        firebase_functions_1.logger.error('Error tracking event:', error);
        throw new functionsV2.https.HttpsError('internal', 'Failed to track event');
    }
});
/**
 * Get user analytics dashboard data
 */
exports.getUserAnalytics = functionsV2.https.onCall(async (request) => {
    if (!request.auth) {
        throw new functionsV2.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = request.auth.uid;
    const { data } = request;
    const { startDate, endDate } = data;
    try {
        const start = startDate ? admin.firestore.Timestamp.fromDate(new Date(startDate)) :
            admin.firestore.Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // 30 days ago
        const end = endDate ? admin.firestore.Timestamp.fromDate(new Date(endDate)) :
            admin.firestore.Timestamp.now();
        // Get user events
        const eventsSnapshot = await db.collection('analytics_events')
            .where('userId', '==', userId)
            .where('timestamp', '>=', start)
            .where('timestamp', '<=', end)
            .orderBy('timestamp', 'desc')
            .limit(1000)
            .get();
        const events = eventsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // Get user orders
        const ordersSnapshot = await db.collection('orders')
            .where('userId', '==', userId)
            .where('createdAt', '>=', start)
            .where('createdAt', '<=', end)
            .get();
        const orders = ordersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // Calculate metrics
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
        return {
            events,
            orders,
            metrics: {
                totalOrders,
                totalSpent,
                avgOrderValue,
                totalEvents: events.length
            }
        };
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting user analytics:', error);
        throw new functionsV2.https.HttpsError('internal', 'Failed to get analytics data');
    }
});
/**
 * Generate daily analytics report
 */
exports.generateDailyReport = functionsV2.scheduler.onSchedule('0 1 * * *', async (event) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const today = new Date(yesterday);
    today.setDate(today.getDate() + 1);
    const startTimestamp = admin.firestore.Timestamp.fromDate(yesterday);
    const endTimestamp = admin.firestore.Timestamp.fromDate(today);
    try {
        // Get daily events
        const eventsSnapshot = await db.collection('analytics_events')
            .where('timestamp', '>=', startTimestamp)
            .where('timestamp', '<', endTimestamp)
            .get();
        // Get daily orders
        const ordersSnapshot = await db.collection('orders')
            .where('createdAt', '>=', startTimestamp)
            .where('createdAt', '<', endTimestamp)
            .get();
        // Get daily users
        const usersSnapshot = await db.collection('users')
            .where('createdAt', '>=', startTimestamp)
            .where('createdAt', '<', endTimestamp)
            .get();
        // Calculate metrics
        const events = eventsSnapshot.docs.map(doc => doc.data());
        const orders = ordersSnapshot.docs.map(doc => doc.data());
        const newUsers = usersSnapshot.size;
        const totalEvents = events.length;
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        // Event breakdown
        const eventBreakdown = {};
        events.forEach(event => {
            eventBreakdown[event.eventName] = (eventBreakdown[event.eventName] || 0) + 1;
        });
        // Order status breakdown
        const orderStatusBreakdown = {};
        orders.forEach(order => {
            orderStatusBreakdown[order.status] = (orderStatusBreakdown[order.status] || 0) + 1;
        });
        // Save daily report
        await db.collection('daily_reports').add({
            date: admin.firestore.Timestamp.fromDate(yesterday),
            metrics: {
                totalEvents,
                totalOrders,
                totalRevenue,
                avgOrderValue,
                newUsers,
                eventBreakdown,
                orderStatusBreakdown
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        firebase_functions_1.logger.info(`Daily report generated for ${yesterday.toISOString().split('T')[0]}`);
    }
    catch (error) {
        firebase_functions_1.logger.error('Error generating daily report:', error);
    }
});
/**
 * Get analytics dashboard data for admin
 */
exports.getAdminAnalytics = functionsV2.https.onCall(async (request) => {
    // Check if user is admin
    if (!request.auth) {
        throw new functionsV2.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userDoc = await db.collection('users').doc(request.auth.uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
        throw new functionsV2.https.HttpsError('permission-denied', 'Admin access required');
    }
    const { data } = request;
    const { startDate, endDate, period = '30d' } = data;
    try {
        let start;
        let end;
        if (startDate && endDate) {
            start = admin.firestore.Timestamp.fromDate(new Date(startDate));
            end = admin.firestore.Timestamp.fromDate(new Date(endDate));
        }
        else {
            // Default periods
            const now = new Date();
            switch (period) {
                case '7d':
                    start = admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
                    break;
                case '30d':
                    start = admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
                    break;
                case '90d':
                    start = admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000));
                    break;
                default:
                    start = admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
            }
            end = admin.firestore.Timestamp.now();
        }
        // Get reports for the period
        const reportsSnapshot = await db.collection('daily_reports')
            .where('date', '>=', start)
            .where('date', '<=', end)
            .orderBy('date', 'asc')
            .get();
        const reports = reportsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // Aggregate metrics
        const totalMetrics = reports.reduce((acc, report) => {
            const metrics = report.metrics;
            return {
                totalEvents: acc.totalEvents + (metrics.totalEvents || 0),
                totalOrders: acc.totalOrders + (metrics.totalOrders || 0),
                totalRevenue: acc.totalRevenue + (metrics.totalRevenue || 0),
                newUsers: acc.newUsers + (metrics.newUsers || 0)
            };
        }, { totalEvents: 0, totalOrders: 0, totalRevenue: 0, newUsers: 0 });
        // Calculate averages
        const avgOrderValue = totalMetrics.totalOrders > 0 ?
            totalMetrics.totalRevenue / totalMetrics.totalOrders : 0;
        // Get current totals
        const totalUsersSnapshot = await db.collection('users').get();
        const totalOrdersSnapshot = await db.collection('orders').get();
        return {
            reports,
            summary: {
                ...totalMetrics,
                avgOrderValue,
                totalUsers: totalUsersSnapshot.size,
                totalOrdersAllTime: totalOrdersSnapshot.size
            }
        };
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting admin analytics:', error);
        throw new functionsV2.https.HttpsError('internal', 'Failed to get analytics data');
    }
});
/**
 * Track page views
 */
exports.trackPageView = functionsV2.https.onCall(async (request) => {
    const { data } = request;
    const { page, referrer } = data;
    const userId = request.auth?.uid || null;
    try {
        await db.collection('page_views').add({
            userId,
            page,
            referrer: referrer || null,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            userAgent: request.rawRequest.headers['user-agent'],
            ip: request.rawRequest.ip,
        });
        firebase_functions_1.logger.info(`Page view tracked: ${page}`);
        return { success: true };
    }
    catch (error) {
        firebase_functions_1.logger.error('Error tracking page view:', error);
        throw new functionsV2.https.HttpsError('internal', 'Failed to track page view');
    }
});
/**
 * Clean up old analytics data
 */
exports.cleanupOldAnalytics = functionsV2.scheduler.onSchedule('0 2 1 * *', async (event) => {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 12); // Keep 12 months of data
    const cutoffTimestamp = admin.firestore.Timestamp.fromDate(cutoffDate);
    try {
        // Clean up old events
        const oldEventsSnapshot = await db.collection('analytics_events')
            .where('timestamp', '<', cutoffTimestamp)
            .limit(500)
            .get();
        const eventBatch = db.batch();
        oldEventsSnapshot.docs.forEach(doc => {
            eventBatch.delete(doc.ref);
        });
        await eventBatch.commit();
        // Clean up old page views
        const oldPageViewsSnapshot = await db.collection('page_views')
            .where('timestamp', '<', cutoffTimestamp)
            .limit(500)
            .get();
        const pageViewBatch = db.batch();
        oldPageViewsSnapshot.docs.forEach(doc => {
            pageViewBatch.delete(doc.ref);
        });
        await pageViewBatch.commit();
        firebase_functions_1.logger.info(`Cleaned up ${oldEventsSnapshot.size} old events and ${oldPageViewsSnapshot.size} old page views`);
    }
    catch (error) {
        firebase_functions_1.logger.error('Error cleaning up old analytics data:', error);
    }
});
exports.analyticsHandlers = {
    trackEvent: exports.trackEvent,
    getUserAnalytics: exports.getUserAnalytics,
    generateDailyReport: exports.generateDailyReport,
    getAdminAnalytics: exports.getAdminAnalytics,
    trackPageView: exports.trackPageView,
    cleanupOldAnalytics: exports.cleanupOldAnalytics,
};
//# sourceMappingURL=analytics.js.map