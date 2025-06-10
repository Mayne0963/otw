import * as functions from 'firebase-functions';
import * as functionsV2 from 'firebase-functions/v2';
/**
 * Order processing functions for handling order lifecycle events
 */
export declare const orderProcessing: {
    /**
     * Process a new order when created
     * - Validates order data
     * - Updates inventory
     * - Sends notifications
     */
    processOrder: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
    /**
     * Update order status and handle status-specific logic
     */
    updateOrderStatus: functionsV2.https.CallableFunction<any, Promise<{
        success: boolean;
        orderId: any;
        status: any;
    }>>;
    /**
     * Calculate order metrics for analytics
     */
    calculateOrderMetrics: functions.CloudFunction<unknown>;
    /**
     * Trigger function when an order is created
     */
    onOrderCreated: functionsV2.CloudFunction<functionsV2.firestore.FirestoreEvent<functionsV2.firestore.QueryDocumentSnapshot | undefined, {
        orderId: string;
    }>>;
    /**
     * Trigger function when an order is updated
     */
    onOrderUpdated: functionsV2.CloudFunction<functionsV2.firestore.FirestoreEvent<functions.Change<functionsV2.firestore.QueryDocumentSnapshot> | undefined, {
        orderId: string;
    }>>;
};
//# sourceMappingURL=orderProcessing.d.ts.map