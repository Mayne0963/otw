import * as functionsV2 from 'firebase-functions/v2';
interface BusinessMetrics {
    totalUsers: number;
    activeUsers: number;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
    period: string;
}
/**
 * Track user events for analytics
 */
export declare const trackUserEvent: functionsV2.https.CallableFunction<any, Promise<{
    success: boolean;
    eventType: any;
    timestamp: string;
}>>;
/**
 * Generate daily analytics report
 */
export declare const generateDailyReport: functionsV2.scheduler.ScheduleFunction;
/**
 * Calculate business metrics
 */
export declare const calculateBusinessMetrics: functionsV2.https.CallableFunction<any, Promise<{
    success: boolean;
    metrics: BusinessMetrics;
    period: any;
}>>;
export declare const analyticsService: {
    trackUserEvent: functionsV2.https.CallableFunction<any, Promise<{
        success: boolean;
        eventType: any;
        timestamp: string;
    }>>;
    generateDailyReport: functionsV2.scheduler.ScheduleFunction;
    calculateBusinessMetrics: functionsV2.https.CallableFunction<any, Promise<{
        success: boolean;
        metrics: BusinessMetrics;
        period: any;
    }>>;
};
export {};
//# sourceMappingURL=analyticsService.d.ts.map