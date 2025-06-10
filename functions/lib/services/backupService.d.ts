import * as functions from 'firebase-functions';
import * as functionsV2 from 'firebase-functions/v2';
/**
 * Daily backup function - runs every day at 2 AM
 */
export declare const dailyBackup: functionsV2.scheduler.ScheduleFunction;
/**
 * Clean up old data - runs weekly on Sundays at 3 AM
 */
export declare const cleanupOldData: functionsV2.scheduler.ScheduleFunction;
/**
 * Sync external data - runs daily at 4 AM
 */
export declare const syncExternalData: functions.CloudFunction<unknown>;
/**
 * Manual backup function
 */
export declare const createManualBackup: functionsV2.https.CallableFunction<any, Promise<{
    success: boolean;
    backupId: string;
    collections: ({
        collection: string;
        documentCount: number;
        fileName: string;
        status: string;
        error?: undefined;
    } | {
        collection: string;
        status: string;
        error: string;
        documentCount?: undefined;
        fileName?: undefined;
    })[];
}>>;
export declare const backupService: {
    dailyBackup: functionsV2.scheduler.ScheduleFunction;
    cleanupOldData: functionsV2.scheduler.ScheduleFunction;
    syncExternalData: functions.CloudFunction<unknown>;
    createManualBackup: functionsV2.https.CallableFunction<any, Promise<{
        success: boolean;
        backupId: string;
        collections: ({
            collection: string;
            documentCount: number;
            fileName: string;
            status: string;
            error?: undefined;
        } | {
            collection: string;
            status: string;
            error: string;
            documentCount?: undefined;
            fileName?: undefined;
        })[];
    }>>;
};
//# sourceMappingURL=backupService.d.ts.map