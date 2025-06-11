import * as functionsV2 from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { Storage } from '@google-cloud/storage';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import axios from 'axios';
import sharp from 'sharp';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const db = admin.firestore();
const storage = new Storage();
const visionClient = new ImageAnnotatorClient();
const secretManager = new SecretManagerServiceClient();

// Initialize Stripe with secret from Secret Manager
let stripe: Stripe;

/**
 * Blaze Plan Features Service
 * These functions require Firebase Blaze Plan due to:
 * - External API calls (outbound networking)
 * - Advanced Cloud Storage operations
 * - Google Cloud Vision API
 * - Secret Manager integration
 * - High-volume processing
 */
export const blazePlanFeatures = {
  /**
   * Advanced image processing with AI analysis
   * Requires: Blaze Plan for Vision API and external storage operations
   */
  processImageWithAI: functionsV2.storage.onObjectFinalized({
    memory: '1GiB',
    timeoutSeconds: 540,
    region: 'us-central1'
  }, async (event) => {
    const object = event.data;
    const filePath = object.name!;
    const bucket = storage.bucket(object.bucket);

    // Only process images
    if (!object.contentType?.startsWith('image/')) {
      return;
    }

    try {
      console.log(`Processing image with AI: ${filePath}`);

      // Download image for processing
      const [imageBuffer] = await bucket.file(filePath).download();

      // 1. AI-powered content analysis using Vision API
      const [result] = await visionClient.annotateImage({
        image: { content: imageBuffer },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 10 },
          { type: 'TEXT_DETECTION' },
          { type: 'SAFE_SEARCH_DETECTION' },
          { type: 'OBJECT_LOCALIZATION' },
          { type: 'FACE_DETECTION' }
        ]
      });

      // 2. Generate multiple optimized versions
      const variants = await Promise.all([
        // Thumbnail (150x150)
        sharp(imageBuffer)
          .resize(150, 150, { fit: 'cover' })
          .jpeg({ quality: 80 })
          .toBuffer(),
        // Medium (800x600)
        sharp(imageBuffer)
          .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer(),
        // WebP version for modern browsers
        sharp(imageBuffer)
          .webp({ quality: 80 })
          .toBuffer()
      ]);

      // 3. Upload variants to storage
      const uploadPromises = [
        bucket.file(`${filePath}_thumb.jpg`).save(variants[0]),
        bucket.file(`${filePath}_medium.jpg`).save(variants[1]),
        bucket.file(`${filePath}.webp`).save(variants[2])
      ];

      await Promise.all(uploadPromises);

      // 4. Store AI analysis results in Firestore
      const analysisData = {
        filePath,
        labels: result.labelAnnotations?.map(label => ({
          description: label.description,
          score: label.score
        })) || [],
        text: result.textAnnotations?.[0]?.description || '',
        safeSearch: result.safeSearchAnnotation,
        objects: result.localizedObjectAnnotations?.map(obj => ({
          name: obj.name,
          score: obj.score,
          boundingPoly: obj.boundingPoly
        })) || [],
        faces: result.faceAnnotations?.length || 0,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        variants: {
          thumbnail: `${filePath}_thumb.jpg`,
          medium: `${filePath}_medium.jpg`,
          webp: `${filePath}.webp`
        }
      };

      await db.collection('image-analysis').add(analysisData);

      console.log(`AI processing completed for: ${filePath}`);
    } catch (error) {
      console.error('Error in AI image processing:', error);
      throw error;
    }
  }),

  /**
   * Advanced payment processing with external APIs
   * Requires: Blaze Plan for external API calls to Stripe and other services
   */
  processAdvancedPayment: functionsV2.https.onCall({
    memory: '512MiB',
    timeoutSeconds: 300,
    region: 'us-central1'
  }, async (request) => {
    if (!request.auth) {
      throw new functionsV2.https.HttpsError('unauthenticated', 'Authentication required');
    }

    const { paymentIntentId, metadata } = request.data;

    try {
      // Initialize Stripe if not already done
      if (!stripe) {
        const [stripeSecret] = await secretManager.accessSecretVersion({
          name: 'projects/your-project-id/secrets/stripe-secret-key/versions/latest'
        });
        stripe = new Stripe(stripeSecret.payload?.data?.toString() || '', {
          apiVersion: '2023-10-16'
        });
      }

      // 1. Retrieve payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        throw new functionsV2.https.HttpsError('failed-precondition', 'Payment not completed');
      }

      // 2. External API call for fraud detection
      const fraudCheck = await axios.post('https://api.frauddetection.com/v1/check', {
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        customer_id: paymentIntent.customer,
        payment_method: paymentIntent.payment_method
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.FRAUD_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      // 3. External API call for tax calculation
      const taxCalculation = await axios.post('https://api.taxservice.com/v1/calculate', {
        amount: paymentIntent.amount / 100, // Convert from cents
        address: metadata.address,
        items: metadata.items
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.TAX_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      // 4. Store comprehensive payment record
      const paymentRecord = {
        paymentIntentId,
        userId: request.auth.uid,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        fraudScore: fraudCheck.data.risk_score,
        fraudStatus: fraudCheck.data.status,
        taxAmount: taxCalculation.data.tax_amount,
        taxRate: taxCalculation.data.tax_rate,
        metadata,
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('advanced-payments').add(paymentRecord);

      // 5. Trigger additional workflows if needed
      if (fraudCheck.data.status === 'high_risk') {
        await db.collection('fraud-alerts').add({
          paymentIntentId,
          userId: request.auth.uid,
          riskScore: fraudCheck.data.risk_score,
          alertedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      return {
        success: true,
        paymentId: paymentRecord,
        fraudStatus: fraudCheck.data.status,
        taxAmount: taxCalculation.data.tax_amount
      };
    } catch (error: any) {
      console.error('Advanced payment processing error:', error);
      throw new functionsV2.https.HttpsError('internal', error.message);
    }
  }),

  /**
   * Bulk data processing and external API synchronization
   * Requires: Blaze Plan for high-volume operations and external calls
   */
  syncExternalData: functionsV2.scheduler.onSchedule({
    schedule: 'every 6 hours',
    timeZone: 'America/New_York',
    memory: '2GiB',
    timeoutSeconds: 540
  }, async () => {
    try {
      console.log('Starting external data synchronization...');

      // 1. Sync restaurant data from external API
      const restaurantResponse = await axios.get('https://api.restaurantpartner.com/v1/locations', {
        headers: {
          'Authorization': `Bearer ${process.env.RESTAURANT_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const restaurants = restaurantResponse.data.locations;
      const batch = db.batch();

      // 2. Update restaurant data in batches
      for (const restaurant of restaurants) {
        const docRef = db.collection('restaurants').doc(restaurant.id);
        batch.set(docRef, {
          ...restaurant,
          lastSynced: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }

      await batch.commit();

      // 3. Sync inventory data
      const inventoryResponse = await axios.get('https://api.inventory.com/v1/items', {
        headers: {
          'Authorization': `Bearer ${process.env.INVENTORY_API_KEY}`
        },
        timeout: 30000
      });

      // 4. Process inventory updates
      const inventoryBatch = db.batch();
      for (const item of inventoryResponse.data.items) {
        const docRef = db.collection('inventory').doc(item.sku);
        inventoryBatch.set(docRef, {
          ...item,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }

      await inventoryBatch.commit();

      // 5. Generate sync report
      await db.collection('sync-reports').add({
        type: 'external-data-sync',
        restaurantsUpdated: restaurants.length,
        inventoryItemsUpdated: inventoryResponse.data.items.length,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'success'
      });

      console.log(`Sync completed: ${restaurants.length} restaurants, ${inventoryResponse.data.items.length} inventory items`);
    } catch (error) {
      console.error('External data sync error:', error);
      
      // Log error for monitoring
      await db.collection('sync-reports').add({
        type: 'external-data-sync',
        error: error.message,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'failed'
      });
    }
  }),

  /**
   * Advanced email service with external SMTP and templates
   * Requires: Blaze Plan for external email service calls
   */
  sendAdvancedEmail: functionsV2.https.onCall({
    memory: '256MiB',
    timeoutSeconds: 60
  }, async (request) => {
    if (!request.auth) {
      throw new functionsV2.https.HttpsError('unauthenticated', 'Authentication required');
    }

    const { templateId, recipientEmail, templateData, priority = 'normal' } = request.data;

    try {
      // 1. Fetch email template from external service
      const templateResponse = await axios.get(`https://api.emailservice.com/v1/templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.EMAIL_SERVICE_API_KEY}`
        },
        timeout: 10000
      });

      const template = templateResponse.data;

      // 2. Configure advanced email transporter
      const transporter = nodemailer.createTransporter({
        host: 'smtp.emailservice.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100
      });

      // 3. Render template with data
      const renderedContent = template.content.replace(/{{(\w+)}}/g, (match: string, key: string) => {
        return templateData[key] || match;
      });

      // 4. Send email with tracking
      const emailOptions = {
        from: process.env.FROM_EMAIL,
        to: recipientEmail,
        subject: template.subject,
        html: renderedContent,
        priority: priority as 'high' | 'normal' | 'low',
        headers: {
          'X-Campaign-ID': templateId,
          'X-User-ID': request.auth.uid
        }
      };

      const result = await transporter.sendMail(emailOptions);

      // 5. Log email activity
      await db.collection('email-logs').add({
        userId: request.auth.uid,
        templateId,
        recipientEmail,
        messageId: result.messageId,
        status: 'sent',
        sentAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error: any) {
      console.error('Advanced email sending error:', error);
      
      // Log failed email
      await db.collection('email-logs').add({
        userId: request.auth.uid,
        templateId,
        recipientEmail,
        error: error.message,
        status: 'failed',
        attemptedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      throw new functionsV2.https.HttpsError('internal', 'Failed to send email');
    }
  })
};