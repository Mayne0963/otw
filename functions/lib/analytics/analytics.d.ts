import * as functionsV2 from 'firebase-functions/v2';
/**
 * Track user events
 */
export declare const trackEvent: functionsV2.https.CallableFunction<any, Promise<{
    success: boolean;
}>>;
/**
 * Get user analytics dashboard data
 */
export declare const getUserAnalytics: functionsV2.https.CallableFunction<any, Promise<{
    events: {
        id: string;
    }[];
    orders: {
        [key: string]: any;
        id: string;
        total?: number;
    }[];
    metrics: {
        totalOrders: number;
        totalSpent: number;
        avgOrderValue: number;
        totalEvents: number;
    };
}>>;
/**
 * Generate daily analytics report
 */
export declare const generateDailyReport: functionsV2.scheduler.ScheduleFunction;
/**
 * Get analytics dashboard data for admin
 */
export declare const getAdminAnalytics: functionsV2.https.CallableFunction<any, Promise<{
    reports: {
        [key: string]: any;
        id: string;
        metrics?: any;
    }[];
    summary: {
        avgOrderValue: number;
        totalUsers: number;
        totalOrdersAllTime: number;
        totalEvents: any;
        totalOrders: any;
        totalRevenue: any;
        newUsers: any;
    };
}>>;
/**
 * Track page views
 */
export declare const trackPageView: functionsV2.https.CallableFunction<any, Promise<{
    success: boolean;
}>>;
/**
 * Clean up old analytics data
 */
export declare const cleanupOldAnalytics: functionsV2.scheduler.ScheduleFunction;
export declare const analyticsHandlers: {
    trackEvent: functionsV2.https.CallableFunction<any, Promise<{
        success: boolean;
    }>>;
    getUserAnalytics: functionsV2.https.CallableFunction<any, Promise<{
        events: {
            id: string;
        }[];
        orders: {
            [key: string]: any;
            id: string;
            total?: number;
        }[];
        metrics: {
            totalOrders: number;
            totalSpent: number;
            avgOrderValue: number;
            totalEvents: number;
        };
    }>>;
    generateDailyReport: functionsV2.scheduler.ScheduleFunction;
    getAdminAnalytics: functionsV2.https.CallableFunction<any, Promise<{
        reports: {
            [key: string]: any;
            id: string;
            metrics?: any;
        }[];
        summary: {
            avgOrderValue: number;
            totalUsers: number;
            totalOrdersAllTime: number;
            totalEvents: any;
            totalOrders: any;
            totalRevenue: any;
            newUsers: any;
        };
    }>>;
    trackPageView: functionsV2.https.CallableFunction<any, Promise<{
        success: boolean;
    }>>;
    cleanupOldAnalytics: functionsV2.scheduler.ScheduleFunction;
};
//# sourceMappingURL=analytics.d.ts.map