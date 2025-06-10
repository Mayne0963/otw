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
exports.imageProcessing = exports.optimizeImages = exports.generateThumbnails = exports.processUploadedImage = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const storage_1 = require("@google-cloud/storage");
const storage_2 = require("firebase-functions/v2/storage");
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
const path = __importStar(require("path"));
const gcs = new storage_1.Storage();
const db = admin.firestore();
/**
 * Process uploaded images when they are added to Storage
 */
exports.processUploadedImage = (0, storage_2.onObjectFinalized)(async (event) => {
    const object = event.data;
    const filePath = object.name;
    const bucket = gcs.bucket(object.bucket);
    const fileName = path.basename(filePath);
    const fileDir = path.dirname(filePath);
    // Only process images
    if (!object.contentType?.startsWith('image/')) {
        console.log('Not an image, skipping processing');
        return;
    }
    // Skip if already processed
    if (fileName.includes('_thumb') || fileName.includes('_optimized')) {
        console.log('Already processed image, skipping');
        return;
    }
    try {
        // Download the image
        const tempFilePath = `/tmp/${fileName}`;
        await bucket.file(filePath).download({ destination: tempFilePath });
        // Generate thumbnails
        await generateImageThumbnails(tempFilePath, bucket, fileDir, fileName);
        // Optimize original image
        await optimizeImage(tempFilePath, bucket, fileDir, fileName);
        // Update metadata in Firestore
        await updateImageMetadata(filePath, object);
        console.log(`Successfully processed image: ${filePath}`);
    }
    catch (error) {
        console.error('Error processing image:', error);
    }
});
/**
 * Generate thumbnails for uploaded images
 */
exports.generateThumbnails = functions.storage.object().onFinalize(async (object) => {
    const filePath = object.name;
    const bucket = gcs.bucket(object.bucket);
    const fileName = path.basename(filePath);
    const fileDir = path.dirname(filePath);
    // Only process images in specific directories
    if (!filePath.startsWith('screenshots/') && !filePath.startsWith('profile-images/')) {
        return;
    }
    if (!object.contentType?.startsWith('image/')) {
        return;
    }
    // Skip if already a thumbnail
    if (fileName.includes('_thumb')) {
        return;
    }
    try {
        const tempFilePath = `/tmp/${fileName}`;
        await bucket.file(filePath).download({ destination: tempFilePath });
        await generateImageThumbnails(tempFilePath, bucket, fileDir, fileName);
        console.log(`Generated thumbnails for: ${filePath}`);
    }
    catch (error) {
        console.error('Error generating thumbnails:', error);
    }
});
/**
 * Optimize images for web delivery
 */
exports.optimizeImages = functions.storage.object().onFinalize(async (object) => {
    const filePath = object.name;
    const bucket = gcs.bucket(object.bucket);
    const fileName = path.basename(filePath);
    const fileDir = path.dirname(filePath);
    // Only process images
    if (!object.contentType?.startsWith('image/')) {
        return;
    }
    // Skip if already optimized
    if (fileName.includes('_optimized') || fileName.includes('_thumb')) {
        return;
    }
    try {
        const tempFilePath = `/tmp/${fileName}`;
        await bucket.file(filePath).download({ destination: tempFilePath });
        await optimizeImage(tempFilePath, bucket, fileDir, fileName);
        console.log(`Optimized image: ${filePath}`);
    }
    catch (error) {
        console.error('Error optimizing image:', error);
    }
});
/**
 * Generate multiple thumbnail sizes
 */
async function generateImageThumbnails(tempFilePath, bucket, fileDir, fileName) {
    const thumbnailSizes = [
        { width: 150, height: 150, suffix: '_thumb_sm' },
        { width: 300, height: 300, suffix: '_thumb_md' },
        { width: 600, height: 600, suffix: '_thumb_lg' },
    ];
    const fileNameWithoutExt = path.parse(fileName).name;
    const fileExt = path.parse(fileName).ext;
    for (const size of thumbnailSizes) {
        const thumbFileName = `${fileNameWithoutExt}${size.suffix}${fileExt}`;
        const thumbFilePath = `/tmp/${thumbFileName}`;
        const thumbStoragePath = path.join(fileDir, thumbFileName);
        // Generate thumbnail
        await (0, sharp_1.default)(tempFilePath)
            .resize(size.width, size.height, {
            fit: 'cover',
            position: 'center',
        })
            .jpeg({ quality: 80 })
            .toFile(thumbFilePath);
        // Upload thumbnail to Storage
        await bucket.upload(thumbFilePath, {
            destination: thumbStoragePath,
            metadata: {
                metadata: {
                    originalFile: fileName,
                    thumbnailSize: `${size.width}x${size.height}`,
                    processedAt: new Date().toISOString(),
                },
            },
        });
        console.log(`Generated thumbnail: ${thumbStoragePath}`);
    }
}
/**
 * Optimize image for web delivery
 */
async function optimizeImage(tempFilePath, bucket, fileDir, fileName) {
    const fileNameWithoutExt = path.parse(fileName).name;
    const optimizedFileName = `${fileNameWithoutExt}_optimized.webp`;
    const optimizedFilePath = `/tmp/${optimizedFileName}`;
    const optimizedStoragePath = path.join(fileDir, optimizedFileName);
    // Optimize and convert to WebP
    await (0, sharp_1.default)(tempFilePath)
        .resize(1920, 1080, {
        fit: 'inside',
        withoutEnlargement: true,
    })
        .webp({ quality: 85 })
        .toFile(optimizedFilePath);
    // Upload optimized image to Storage
    await bucket.upload(optimizedFilePath, {
        destination: optimizedStoragePath,
        metadata: {
            metadata: {
                originalFile: fileName,
                optimized: 'true',
                format: 'webp',
                processedAt: new Date().toISOString(),
            },
        },
    });
    console.log(`Optimized image: ${optimizedStoragePath}`);
}
/**
 * Update image metadata in Firestore
 */
async function updateImageMetadata(filePath, object) {
    const imageId = (0, uuid_1.v4)();
    const metadata = {
        id: imageId,
        filePath,
        fileName: path.basename(filePath),
        contentType: object.contentType,
        size: parseInt(object.size),
        bucket: object.bucket,
        timeCreated: object.timeCreated,
        updated: object.updated,
        md5Hash: object.md5Hash,
        crc32c: object.crc32c,
        etag: object.etag,
        generation: object.generation,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    // Determine collection based on file path
    let collection = 'images';
    if (filePath.startsWith('screenshots/')) {
        collection = 'screenshot_images';
    }
    else if (filePath.startsWith('profile-images/')) {
        collection = 'profile_images';
    }
    await db.collection(collection).doc(imageId).set(metadata);
    console.log(`Updated metadata for image: ${filePath}`);
}
exports.imageProcessing = {
    processUploadedImage: exports.processUploadedImage,
    generateThumbnails: exports.generateThumbnails,
    optimizeImages: exports.optimizeImages,
};
//# sourceMappingURL=imageProcessing.js.map