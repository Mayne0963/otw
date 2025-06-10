import * as functionsV2 from 'firebase-functions/v2';
/**
 * Notification service functions for handling various types of notifications
 */
export declare const notificationService: {
    /**
     * Send order-related notifications (email and push)
     */
    sendOrderNotification: functionsV2.https.CallableFunction<any, Promise<{
        success: boolean;
        results: ({
            type: string;
            success: boolean;
            messageId: string;
            error?: undefined;
        } | {
            type: string;
            success: boolean;
            error: string;
            messageId?: undefined;
        } | {
            type: string;
            success: boolean;
            messageId?: undefined;
            error?: undefined;
        })[];
    }>>;
    /**
     * Send welcome email to new users
     */
    sendWelcomeEmail: functionsV2.https.CallableFunction<any, Promise<{
        success: boolean;
    }>>;
    /**
     * Send password reset email
     */
    sendPasswordResetEmail: functionsV2.https.CallableFunction<any, Promise<{
        success: boolean;
    }>>;
    /**
     * Send promotional email to users
     */
    sendPromotionalEmail: functionsV2.https.CallableFunction<any, Promise<{
        success: boolean;
        totalSent: number;
        totalFailed: number;
        results: {
            success: boolean;
            userId: string;
            email: string;
            error?: string;
        }[];
    }>>;
    /**
     * Send push notification to specific users or topics
     */
    sendPushNotification: functionsV2.https.CallableFunction<any, Promise<{
        success: boolean;
        results: ({
            type: string;
            topic: any;
            success: boolean;
            messageId: string;
            successCount?: undefined;
            failureCount?: undefined;
            responses?: undefined;
        } | {
            type: string;
            successCount: number;
            failureCount: number;
            responses: import("firebase-admin/lib/messaging/messaging-api").SendResponse[];
            topic?: undefined;
            success?: undefined;
            messageId?: undefined;
        })[];
    }>>;
};
//# sourceMappingURL=notificationService.d.ts.map