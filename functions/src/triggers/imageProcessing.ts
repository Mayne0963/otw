import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Storage } from '@google-cloud/storage';
import { onObjectFinalized } from 'firebase-functions/v2/storage';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

const gcs = new Storage();
const db = admin.firestore();

/**
 * Process uploaded images when they are added to Storage
 */
export const processUploadedImage = onObjectFinalized(async (event) => {
  const object = event.data;
  const filePath = object.name!;
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
  } catch (error) {
    console.error('Error processing image:', error);
  }
});

/**
 * Generate thumbnails for uploaded images
 */
export const generateThumbnails = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name!;
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
  } catch (error) {
    console.error('Error generating thumbnails:', error);
  }
});

/**
 * Optimize images for web delivery
 */
export const optimizeImages = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name!;
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
  } catch (error) {
    console.error('Error optimizing image:', error);
  }
});

/**
 * Generate multiple thumbnail sizes
 */
async function generateImageThumbnails(
  tempFilePath: string,
  bucket: any,
  fileDir: string,
  fileName: string
) {
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
    await sharp(tempFilePath)
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
async function optimizeImage(
  tempFilePath: string,
  bucket: any,
  fileDir: string,
  fileName: string
) {
  const fileNameWithoutExt = path.parse(fileName).name;
  const optimizedFileName = `${fileNameWithoutExt}_optimized.webp`;
  const optimizedFilePath = `/tmp/${optimizedFileName}`;
  const optimizedStoragePath = path.join(fileDir, optimizedFileName);

  // Optimize and convert to WebP
  await sharp(tempFilePath)
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
async function updateImageMetadata(filePath: string, object: any) {
  const imageId = uuidv4();
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
  } else if (filePath.startsWith('profile-images/')) {
    collection = 'profile_images';
  }

  await db.collection(collection).doc(imageId).set(metadata);
  console.log(`Updated metadata for image: ${filePath}`);
}



export const imageProcessing = {
  processUploadedImage,
  generateThumbnails,
  optimizeImages,
};