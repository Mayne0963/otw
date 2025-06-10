/**
 * Enhanced Cloud Functions with MCP Integration
 * 
 * This module provides comprehensive Cloud Functions integrated with MCP
 * for automated serverless backend management, monitoring, and deployment.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Request, Response } from 'express';
import { CallableContext } from 'firebase-functions/v1/https';
import { EventContext } from 'firebase-functions';
import { DocumentSnapshot } from 'firebase-functions/v1/firestore';
import { UserRecord } from 'firebase-functions/v1/auth';
import { ObjectMetadata } from 'firebase-functions/v1/storage';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

// Types and Interfaces
interface MCPFunctionConfig {
  region: string;
  memory: '128MB' | '256MB' | '512MB' | '1GB' | '2GB' | '4GB' | '8GB';
  timeout: number;
  maxInstances?: number;
  minInstances?: number;
  concurrency?: number;
  vpcConnector?: string;
  ingressSettings?: 'ALLOW_ALL' | 'ALLOW_INTERNAL_ONLY' | 'ALLOW_INTERNAL_AND_GCLB';
  environmentVariables?: Record<string, string>;
}

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  tokens?: string[];
  topic?: string;
  condition?: string;
}

interface EmailPayload {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: any[];
}

interface AnalyticsEvent {
  eventName: string;
  userId?: string;
  sessionId?: string;
  properties: Record<string, any>;
  timestamp: admin.firestore.Timestamp;
}

// Default MCP Function Configuration
const defaultMCPConfig: MCPFunctionConfig = {
  region: 'us-central1',
  memory: '256MB',
  timeout: 60,
  maxInstances: 100,
  minInstances: 0,
  concurrency: 80,
  ingressSettings: 'ALLOW_ALL'
};

// Utility function to create MCP-enhanced functions
function createMCPFunction(
  config: Partial<MCPFunctionConfig> = {}
): functions.FunctionBuilder {
  const finalConfig = { ...defaultMCPConfig, ...config };
  
  return functions
    .region(finalConfig.region)
    .runWith({
      memory: finalConfig.memory,
      timeoutSeconds: finalConfig.timeout,
      maxInstances: finalConfig.maxInstances,
      minInstances: finalConfig.minInstances,
      concurrency: finalConfig.concurrency,
      ingressSettings: finalConfig.ingressSettings,
      environmentVariables: finalConfig.environmentVariables
    });
}

// Enhanced User Management Functions
export const createUserProfile = createMCPFunction({
  memory: '512MB',
  timeout: 30
}).auth.user().onCreate(async (user: UserRecord, context: EventContext) => {
  try {
    console.log(`Creating profile for user: ${user.uid}`);
    
    const userProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: null,
      preferences: {
        notifications: true,
        theme: 'light',
        language: 'en'
      },
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
        source: 'auth_trigger'
      }
    };

    // Create user profile in Firestore
    await db.collection('users').doc(user.uid).set(userProfile);

    // Log analytics event
    await logAnalyticsEvent({
      eventName: 'user_created',
      userId: user.uid,
      properties: {
        email: user.email,
        provider: user.providerData[0]?.providerId || 'email',
        emailVerified: user.emailVerified
      },
      timestamp: admin.firestore.Timestamp.now()
    });

    // Send welcome notification
    if (user.email) {
      await sendWelcomeEmail({
        to: user.email,
        subject: 'Welcome to Our Platform!',
        html: `
          <h1>Welcome ${user.displayName || 'there'}!</h1>
          <p>Thank you for joining our platform. We're excited to have you on board.</p>
          <p>Get started by exploring our features and customizing your profile.</p>
        `
      });
    }

    console.log(`User profile created successfully for: ${user.uid}`);
  } catch (error) {
    console.error(`Error creating user profile for ${user.uid}:`, error);
    
    // Log error for monitoring
    await logError('createUserProfile', error, {
      userId: user.uid,
      email: user.email
    });
    
    throw error;
  }
});

export const updateUserProfile = createMCPFunction({
  memory: '256MB',
  timeout: 30
}).auth.user().onDelete(async (user: UserRecord, context: EventContext) => {
  try {
    console.log(`Cleaning up data for deleted user: ${user.uid}`);
    
    const batch = db.batch();
    
    // Delete user profile
    batch.delete(db.collection('users').doc(user.uid));
    
    // Delete user's orders
    const ordersSnapshot = await db.collection('orders')
      .where('userId', '==', user.uid)
      .get();
    
    ordersSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete user's notifications
    const notificationsSnapshot = await db.collection('notifications')
      .where('userId', '==', user.uid)
      .get();
    
    notificationsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    // Log analytics event
    await logAnalyticsEvent({
      eventName: 'user_deleted',
      userId: user.uid,
      properties: {
        email: user.email,
        deletedAt: new Date().toISOString()
      },
      timestamp: admin.firestore.Timestamp.now()
    });
    
    console.log(`User data cleanup completed for: ${user.uid}`);
  } catch (error) {
    console.error(`Error cleaning up user data for ${user.uid}:`, error);
    await logError('updateUserProfile', error, { userId: user.uid });
    throw error;
  }
});

// Enhanced Order Processing Functions
export const processNewOrder = createMCPFunction({
  memory: '512MB',
  timeout: 60
}).firestore.document('orders/{orderId}').onCreate(async (snap: DocumentSnapshot, context: EventContext) => {
  try {
    const orderId = context.params.orderId;
    const orderData = snap.data();
    
    if (!orderData) {
      throw new Error('Order data is missing');
    }
    
    console.log(`Processing new order: ${orderId}`);
    
    // Validate order data
    const validationResult = await validateOrderData(orderData);
    if (!validationResult.isValid) {
      throw new Error(`Order validation failed: ${validationResult.errors.join(', ')}`);
    }
    
    // Update inventory
    await updateInventory(orderData.items, 'decrease');
    
    // Calculate totals and taxes
    const calculations = await calculateOrderTotals(orderData);
    
    // Update order with calculations
    await snap.ref.update({
      subtotal: calculations.subtotal,
      tax: calculations.tax,
      total: calculations.total,
      status: 'confirmed',
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Send confirmation notifications
    await Promise.all([
      sendOrderConfirmationEmail(orderData, orderId),
      sendOrderNotificationToAdmin(orderData, orderId),
      sendPushNotification({
        title: 'Order Confirmed',
        body: `Your order #${orderId} has been confirmed!`,
        tokens: [orderData.fcmToken].filter(Boolean)
      })
    ]);
    
    // Log analytics event
    await logAnalyticsEvent({
      eventName: 'order_created',
      userId: orderData.userId,
      properties: {
        orderId,
        total: calculations.total,
        itemCount: orderData.items.length,
        paymentMethod: orderData.paymentMethod
      },
      timestamp: admin.firestore.Timestamp.now()
    });
    
    console.log(`Order processed successfully: ${orderId}`);
  } catch (error) {
    console.error(`Error processing order ${context.params.orderId}:`, error);
    
    // Update order status to failed
    await snap.ref.update({
      status: 'failed',
      error: error.message,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    await logError('processNewOrder', error, {
      orderId: context.params.orderId,
      orderData: snap.data()
    });
    
    throw error;
  }
});

export const updateOrderStatus = createMCPFunction({
  memory: '256MB',
  timeout: 30
}).firestore.document('orders/{orderId}').onUpdate(async (change, context) => {
  try {
    const orderId = context.params.orderId;
    const beforeData = change.before.data();
    const afterData = change.after.data();
    
    if (!beforeData || !afterData) {
      return;
    }
    
    // Check if status changed
    if (beforeData.status !== afterData.status) {
      console.log(`Order status changed: ${orderId} from ${beforeData.status} to ${afterData.status}`);
      
      // Send status update notification
      await sendOrderStatusUpdateNotification(afterData, orderId);
      
      // Log analytics event
      await logAnalyticsEvent({
        eventName: 'order_status_updated',
        userId: afterData.userId,
        properties: {
          orderId,
          previousStatus: beforeData.status,
          newStatus: afterData.status,
          total: afterData.total
        },
        timestamp: admin.firestore.Timestamp.now()
      });
      
      // Handle specific status changes
      switch (afterData.status) {
        case 'shipped':
          await handleOrderShipped(afterData, orderId);
          break;
        case 'delivered':
          await handleOrderDelivered(afterData, orderId);
          break;
        case 'cancelled':
          await handleOrderCancelled(afterData, orderId);
          break;
      }
    }
  } catch (error) {
    console.error(`Error updating order status for ${context.params.orderId}:`, error);
    await logError('updateOrderStatus', error, {
      orderId: context.params.orderId
    });
  }
});

// Enhanced Storage Functions
export const processImageUpload = createMCPFunction({
  memory: '1GB',
  timeout: 120
}).storage.object().onFinalize(async (object: ObjectMetadata) => {
  try {
    const filePath = object.name;
    const contentType = object.contentType;
    
    if (!filePath || !contentType?.startsWith('image/')) {
      console.log('Not an image file, skipping processing');
      return;
    }
    
    console.log(`Processing image upload: ${filePath}`);
    
    const bucket = storage.bucket(object.bucket);
    const file = bucket.file(filePath);
    
    // Generate thumbnails
    await generateImageThumbnails(file, filePath);
    
    // Extract metadata
    const metadata = await extractImageMetadata(file);
    
    // Store metadata in Firestore
    await db.collection('image_metadata').add({
      filePath,
      originalName: object.name,
      contentType,
      size: object.size,
      metadata,
      uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
      thumbnails: {
        small: `thumbnails/small_${filePath}`,
        medium: `thumbnails/medium_${filePath}`,
        large: `thumbnails/large_${filePath}`
      }
    });
    
    // Log analytics event
    await logAnalyticsEvent({
      eventName: 'image_uploaded',
      properties: {
        filePath,
        contentType,
        size: object.size,
        hasMetadata: !!metadata
      },
      timestamp: admin.firestore.Timestamp.now()
    });
    
    console.log(`Image processing completed: ${filePath}`);
  } catch (error) {
    console.error(`Error processing image upload for ${object.name}:`, error);
    await logError('processImageUpload', error, {
      filePath: object.name,
      contentType: object.contentType
    });
  }
});

// Enhanced HTTP Functions
export const apiHealthCheck = createMCPFunction({
  memory: '128MB',
  timeout: 10
}).https.onRequest(async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Check database connectivity
    const dbCheck = await checkDatabaseHealth();
    
    // Check storage connectivity
    const storageCheck = await checkStorageHealth();
    
    // Check auth service
    const authCheck = await checkAuthHealth();
    
    const responseTime = Date.now() - startTime;
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      services: {
        database: dbCheck,
        storage: storageCheck,
        auth: authCheck
      },
      version: process.env.FUNCTIONS_VERSION || '1.0.0',
      region: process.env.FUNCTION_REGION || 'us-central1'
    };
    
    res.status(200).json(healthStatus);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export const sendNotification = createMCPFunction({
  memory: '256MB',
  timeout: 30
}).https.onCall(async (data: NotificationPayload, context: CallableContext) => {
  try {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    console.log(`Sending notification from user: ${context.auth.uid}`);
    
    // Validate notification data
    if (!data.title || !data.body) {
      throw new functions.https.HttpsError('invalid-argument', 'Title and body are required');
    }
    
    // Send push notification
    const result = await sendPushNotification(data);
    
    // Log analytics event
    await logAnalyticsEvent({
      eventName: 'notification_sent',
      userId: context.auth.uid,
      properties: {
        title: data.title,
        hasTokens: !!data.tokens?.length,
        hasTopic: !!data.topic,
        hasCondition: !!data.condition
      },
      timestamp: admin.firestore.Timestamp.now()
    });
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending notification:', error);
    await logError('sendNotification', error, {
      userId: context.auth?.uid,
      notificationData: data
    });
    throw error;
  }
});

// Enhanced Analytics Functions
export const trackAnalyticsEvent = createMCPFunction({
  memory: '256MB',
  timeout: 30
}).https.onCall(async (data: AnalyticsEvent, context: CallableContext) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    const eventData = {
      ...data,
      userId: context.auth.uid,
      timestamp: admin.firestore.Timestamp.now(),
      sessionId: data.sessionId || generateSessionId(),
      userAgent: context.rawRequest.headers['user-agent'],
      ipAddress: context.rawRequest.ip
    };
    
    await logAnalyticsEvent(eventData);
    
    return { success: true, eventId: generateEventId() };
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    throw new functions.https.HttpsError('internal', 'Failed to track event');
  }
});

// Utility Functions
async function validateOrderData(orderData: any): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  if (!orderData.userId) errors.push('User ID is required');
  if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
    errors.push('Order must contain at least one item');
  }
  if (!orderData.paymentMethod) errors.push('Payment method is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

async function updateInventory(items: any[], operation: 'increase' | 'decrease'): Promise<void> {
  const batch = db.batch();
  
  for (const item of items) {
    const inventoryRef = db.collection('inventory').doc(item.productId);
    const inventoryDoc = await inventoryRef.get();
    
    if (inventoryDoc.exists) {
      const currentStock = inventoryDoc.data()?.stock || 0;
      const adjustment = operation === 'decrease' ? -item.quantity : item.quantity;
      
      batch.update(inventoryRef, {
        stock: currentStock + adjustment,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }
  
  await batch.commit();
}

async function calculateOrderTotals(orderData: any): Promise<{ subtotal: number; tax: number; total: number }> {
  let subtotal = 0;
  
  for (const item of orderData.items) {
    subtotal += item.price * item.quantity;
  }
  
  const taxRate = 0.08; // 8% tax rate
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  
  return { subtotal, tax, total };
}

async function sendWelcomeEmail(emailData: EmailPayload): Promise<void> {
  // Implementation would depend on your email service (SendGrid, Mailgun, etc.)
  console.log('Sending welcome email:', emailData);
}

async function sendOrderConfirmationEmail(orderData: any, orderId: string): Promise<void> {
  console.log('Sending order confirmation email:', { orderData, orderId });
}

async function sendOrderNotificationToAdmin(orderData: any, orderId: string): Promise<void> {
  console.log('Sending order notification to admin:', { orderData, orderId });
}

async function sendOrderStatusUpdateNotification(orderData: any, orderId: string): Promise<void> {
  console.log('Sending order status update notification:', { orderData, orderId });
}

async function sendPushNotification(payload: NotificationPayload): Promise<{ messageId: string }> {
  try {
    const message: any = {
      notification: {
        title: payload.title,
        body: payload.body
      },
      data: payload.data || {}
    };
    
    if (payload.tokens) {
      message.tokens = payload.tokens;
    } else if (payload.topic) {
      message.topic = payload.topic;
    } else if (payload.condition) {
      message.condition = payload.condition;
    }
    
    const response = await admin.messaging().send(message);
    return { messageId: response };
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}

async function handleOrderShipped(orderData: any, orderId: string): Promise<void> {
  console.log('Handling order shipped:', { orderData, orderId });
}

async function handleOrderDelivered(orderData: any, orderId: string): Promise<void> {
  console.log('Handling order delivered:', { orderData, orderId });
}

async function handleOrderCancelled(orderData: any, orderId: string): Promise<void> {
  // Restore inventory
  await updateInventory(orderData.items, 'increase');
  console.log('Handling order cancelled:', { orderData, orderId });
}

async function generateImageThumbnails(file: any, filePath: string): Promise<void> {
  console.log('Generating image thumbnails for:', filePath);
  // Implementation would use Sharp or similar library
}

async function extractImageMetadata(file: any): Promise<any> {
  console.log('Extracting image metadata');
  // Implementation would extract EXIF data, etc.
  return {};
}

async function checkDatabaseHealth(): Promise<{ status: string; responseTime: number }> {
  const startTime = Date.now();
  try {
    await db.collection('health_check').limit(1).get();
    return {
      status: 'healthy',
      responseTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime
    };
  }
}

async function checkStorageHealth(): Promise<{ status: string; responseTime: number }> {
  const startTime = Date.now();
  try {
    await storage.bucket().getMetadata();
    return {
      status: 'healthy',
      responseTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime
    };
  }
}

async function checkAuthHealth(): Promise<{ status: string; responseTime: number }> {
  const startTime = Date.now();
  try {
    await auth.listUsers(1);
    return {
      status: 'healthy',
      responseTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime
    };
  }
}

async function logAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  try {
    await db.collection('analytics_events').add(event);
  } catch (error) {
    console.error('Error logging analytics event:', error);
  }
}

async function logError(functionName: string, error: any, context?: any): Promise<void> {
  try {
    await db.collection('error_logs').add({
      functionName,
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      context,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (logError) {
    console.error('Error logging error:', logError);
  }
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateEventId(): string {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Export all functions
export {
  createMCPFunction,
  validateOrderData,
  updateInventory,
  calculateOrderTotals,
  sendPushNotification,
  logAnalyticsEvent,
  logError
};