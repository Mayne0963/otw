import * as functions from 'firebase-functions';
import * as functionsV2 from 'firebase-functions/v2';
/**
 * User management functions for handling user lifecycle events
 */
export declare const userManagement: {
    /**
     * Trigger when a new user is created in Firebase Auth
     * Creates user profile in Firestore and sends welcome email
     */
    onUserCreated: functions.CloudFunction<import("firebase-admin/auth").UserRecord>;
    /**
     * Trigger when a user is deleted from Firebase Auth
     * Cleans up user data across all collections
     */
    onUserDeleted: functions.CloudFunction<import("firebase-admin/auth").UserRecord>;
    /**
     * Update user profile with validation and analytics tracking
     */
    updateUserProfile: functionsV2.https.CallableFunction<any, Promise<{
        success: boolean;
        userId: string;
    }>>;
    /**
     * Get user analytics data
     */
    getUserAnalytics: functionsV2.https.CallableFunction<any, Promise<{
        success: boolean;
        analytics: {
            profile: {
                displayName: any;
                email: any;
                tier: any;
                loyaltyPoints: any;
                memberSince: any;
            };
            orderStats: {
                totalOrders: any;
                totalSpent: any;
                completedOrders: any;
                averageOrderValue: number;
                lastOrderDate: any;
            };
            engagement: {
                loginCount: any;
                sessionCount: any;
                averageSessionDuration: any;
                lastLoginDate: any;
            };
            preferences: {
                favoriteCategories: any;
                favoriteRestaurants: any;
                dietary: any;
            };
            recentOrders: {
                id: string;
            }[];
        };
    }>>;
    /**
     * Track user login for analytics
     */
    trackUserLogin: functionsV2.https.CallableFunction<any, Promise<{
        success: boolean;
    }>>;
};
//# sourceMappingURL=userManagement.d.ts.map