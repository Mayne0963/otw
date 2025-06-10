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
exports.orderProcessing = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const functionsV2 = __importStar(require("firebase-functions/v2"));
const db = admin.firestore();
/**
 * Order processing functions for handling order lifecycle events
 */
exports.orderProcessing = {
    /**
     * Process a new order when created
     * - Validates order data
     * - Updates inventory
     * - Sends notifications
     */
    processOrder: functions.firestore
        .document('orders/{orderId}')
        .onCreate(async (snapshot, context) => {
        try {
            const orderId = context.params.orderId;
            const orderData = snapshot.data();
            console.log(`Processing new order: ${orderId}`);
            // Validate order data
            if (!orderData.items || !orderData.userRef) {
                console.error(`Invalid order data for order ${orderId}`);
                return null;
            }
            // Update order status to processing
            await snapshot.ref.update({
                status: 'processing',
                processingStartedAt: admin.firestore.FieldValue.serverTimestamp(),
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            });
            // Get user data for notifications
            const userRef = db.collection('users').doc(orderData.userRef);
            const userSnapshot = await userRef.get();
            const userData = userSnapshot.data();
            if (!userData) {
                console.error(`User not found for order ${orderId}`);
                return null;
            }
            // Update user's order count
            await userRef.update({
                orderCount: admin.firestore.FieldValue.increment(1),
                totalSpent: admin.firestore.FieldValue.increment(orderData.total || 0),
                lastOrderDate: admin.firestore.FieldValue.serverTimestamp(),
            });
            // Return success
            return { success: true, orderId };
        }
        catch (error) {
            console.error('Error processing order:', error);
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    }),
    /**
     * Update order status and handle status-specific logic
     */
    updateOrderStatus: functionsV2.https.onCall(async (request) => {
        // Ensure user is authenticated
        if (!request.auth) {
            throw new functionsV2.https.HttpsError('unauthenticated', 'You must be logged in to update an order.');
        }
        const { data } = request;
        const { orderId, status } = data;
        if (!orderId || !status) {
            throw new functionsV2.https.HttpsError('invalid-argument', 'Order ID and status are required.');
        }
        try {
            // Get the order
            const orderRef = db.collection('orders').doc(orderId);
            const orderSnapshot = await orderRef.get();
            if (!orderSnapshot.exists) {
                throw new functionsV2.https.HttpsError('not-found', `Order ${orderId} not found.`);
            }
            const orderData = orderSnapshot.data();
            if (!orderData) {
                throw new functionsV2.https.HttpsError('not-found', `Order ${orderId} data not found.`);
            }
            // Check permissions (only allow user who created the order or admin)
            const isAdmin = request.auth.token.admin === true;
            const isOrderOwner = orderData.userRef === request.auth.uid;
            if (!isAdmin && !isOrderOwner) {
                throw new functionsV2.https.HttpsError('permission-denied', 'You do not have permission to update this order.');
            }
            // Update the order status
            await orderRef.update({
                status,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                [`statusHistory.${status}`]: admin.firestore.FieldValue.serverTimestamp(),
            });
            // Handle status-specific logic
            switch (status) {
                case 'completed':
                    // Update user's completed order count
                    if (orderData.userRef) {
                        await db.collection('users').doc(orderData.userRef).update({
                            completedOrderCount: admin.firestore.FieldValue.increment(1),
                        });
                    }
                    break;
                case 'cancelled':
                    // Handle cancellation logic if needed
                    break;
            }
            return { success: true, orderId, status };
        }
        catch (error) {
            console.error('Error updating order status:', error);
            throw new functionsV2.https.HttpsError('internal', `Failed to update order status: ${error.message}`);
        }
    }),
    /**
     * Calculate order metrics for analytics
     */
    calculateOrderMetrics: functions.pubsub
        .schedule('0 0 * * *')
        .timeZone('America/New_York')
        .onRun(async () => {
        try {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            // Query orders from yesterday
            const ordersSnapshot = await db.collection('orders')
                .where('createdAt', '>=', yesterday)
                .where('createdAt', '<', todayStart)
                .get();
            // Calculate metrics
            let totalOrders = 0;
            let totalRevenue = 0;
            let completedOrders = 0;
            let cancelledOrders = 0;
            ordersSnapshot.forEach((doc) => {
                const order = doc.data();
                totalOrders++;
                totalRevenue += order.total || 0;
                if (order.status === 'completed') {
                    completedOrders++;
                }
                else if (order.status === 'cancelled') {
                    cancelledOrders++;
                }
            });
            // Save metrics to Firestore
            const dateStr = yesterday.toISOString().split('T')[0];
            await db.collection('analytics').doc(`daily_orders_${dateStr}`).set({
                date: dateStr,
                totalOrders,
                totalRevenue,
                completedOrders,
                cancelledOrders,
                averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return { success: true };
        }
        catch (error) {
            console.error('Error calculating order metrics:', error);
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    }),
    /**
     * Trigger function when an order is created
     */
    onOrderCreated: functionsV2.firestore.onDocumentCreated('orders/{orderId}', async (event) => {
        const orderId = event.params.orderId;
        const orderData = event.data?.data();
        if (!orderData) {
            console.log('Missing order data, skipping order creation processing');
            return null;
        }
        console.log(`New order created: ${orderId}`);
        try {
            // Send notification to admin about new order
            const adminMessage = {
                notification: {
                    title: 'New Order Received',
                    body: `Order #${orderId} has been received.`,
                },
                topic: 'admin-new-orders',
            };
            await admin.messaging().send(adminMessage);
            // Send confirmation to user if they have a device token
            if (orderData.userRef) {
                const userDoc = await db.collection('users').doc(orderData.userRef).get();
                const userData = userDoc.data();
                if (userData && userData.fcmToken) {
                    const userMessage = {
                        notification: {
                            title: 'Order Confirmation',
                            body: `Your order #${orderId} has been received and is being processed.`,
                        },
                        token: userData.fcmToken,
                    };
                    await admin.messaging().send(userMessage);
                }
            }
            return { success: true };
        }
        catch (error) {
            console.error('Error sending order notifications:', error);
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    }),
    /**
     * Trigger function when an order is updated
     */
    onOrderUpdated: functionsV2.firestore.onDocumentUpdated('orders/{orderId}', async (event) => {
        const orderId = event.params.orderId;
        const newData = event.data?.after.data();
        const previousData = event.data?.before.data();
        // Check if data exists
        if (!newData || !previousData) {
            console.log('Missing order data, skipping update processing');
            return null;
        }
        // Only process if status has changed
        if (newData.status === previousData.status) {
            return null;
        }
        console.log(`Order ${orderId} status changed from ${previousData.status} to ${newData.status}`);
        try {
            // Send notification to user about status change if they have a device token
            if (newData.userRef) {
                const userDoc = await db.collection('users').doc(newData.userRef).get();
                const userData = userDoc.data();
                if (userData && userData.fcmToken) {
                    let title = 'Order Update';
                    let body = `Your order #${orderId} status has been updated to ${newData.status}.`;
                    // Customize message based on status
                    switch (newData.status) {
                        case 'preparing':
                            title = 'Order Being Prepared';
                            body = `Your order #${orderId} is now being prepared.`;
                            break;
                        case 'ready':
                            title = 'Order Ready for Pickup';
                            body = `Your order #${orderId} is ready for pickup.`;
                            break;
                        case 'completed':
                            title = 'Order Completed';
                            body = `Your order #${orderId} has been completed. Thank you for your business!`;
                            break;
                        case 'cancelled':
                            title = 'Order Cancelled';
                            body = `Your order #${orderId} has been cancelled.`;
                            break;
                    }
                    const message = {
                        notification: { title, body },
                        token: userData.fcmToken,
                    };
                    await admin.messaging().send(message);
                }
            }
            return { success: true };
        }
        catch (error) {
            console.error('Error sending order update notification:', error);
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    }),
};
//# sourceMappingURL=orderProcessing.js.map