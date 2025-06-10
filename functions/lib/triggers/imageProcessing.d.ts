import * as functions from 'firebase-functions';
/**
 * Process uploaded images when they are added to Storage
 */
export declare const processUploadedImage: import("firebase-functions/v2").CloudFunction<import("firebase-functions/v2/storage").StorageEvent>;
/**
 * Generate thumbnails for uploaded images
 */
export declare const generateThumbnails: functions.CloudFunction<functions.storage.ObjectMetadata>;
/**
 * Optimize images for web delivery
 */
export declare const optimizeImages: functions.CloudFunction<functions.storage.ObjectMetadata>;
export declare const imageProcessing: {
    processUploadedImage: import("firebase-functions/v2").CloudFunction<import("firebase-functions/v2/storage").StorageEvent>;
    generateThumbnails: functions.CloudFunction<functions.storage.ObjectMetadata>;
    optimizeImages: functions.CloudFunction<functions.storage.ObjectMetadata>;
};
//# sourceMappingURL=imageProcessing.d.ts.map