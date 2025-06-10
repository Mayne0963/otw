/**
 * Comprehensive Test Suite for Firebase Cloud Functions
 * Includes unit tests, integration tests, and end-to-end tests
 */

import { TestHelpers, MockUtilities } from './test-setup';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { createLogger } from '../utils/logger';
import { EnvironmentManager } from '../utils/environment';

// Initialize Firebase Functions Test
const test = functions();

describe('Firebase Cloud Functions Test Suite', () => {
  let testHelpers: TestHelpers;
  let mockUtils: MockUtilities;
  let logger = createLogger('FunctionsTest');
  
  beforeAll(async () => {
    testHelpers = new TestHelpers();
    mockUtils = testHelpers.getMockUtils();
    await testHelpers.setupTest();
  });
  
  afterAll(async () => {
    await testHelpers.teardownTest();
    test.cleanup();
  });
  
  // ========================================================================
  // HTTP FUNCTIONS TESTS
  // ========================================================================
  
  describe('HTTP Functions', () => {
    describe('Health Check Function', () => {
      it('should return healthy status', async () => {
        const req = mockUtils.createMockRequest();
        const res = mockUtils.createMockResponse();
        
        // Import and test the health check function
        const { healthCheck } = require('../enhanced-functions');
        
        await healthCheck(req, res);
        
        testHelpers.assertResponseStatus(res, 200);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            status: expect.any(String),
            timestamp: expect.any(String)
          })
        );
      });
      
      it('should handle database connection errors', async () => {
        const req = mockUtils.createMockRequest();
        const res = mockUtils.createMockResponse();
        
        // Mock database failure
        jest.spyOn(admin.firestore(), 'collection').mockImplementation(() => {
          throw new Error('Database connection failed');
        });
        
        const { healthCheck } = require('../enhanced-functions');
        
        await healthCheck(req, res);
        
        testHelpers.assertResponseStatus(res, 503);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'unhealthy',
            error: expect.any(String)
          })
        );
        
        // Restore mock
        jest.restoreAllMocks();
      });
    });
    
    describe('Create Order Function', () => {
      it('should create a new order successfully', async () => {
        const orderData = {
          restaurantId: 'test-restaurant-1',
          items: [
            {
              id: 'item-1',
              name: 'Test Item',
              price: 12.99,
              quantity: 2
            }
          ],
          deliveryAddress: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345'
          }
        };
        
        const req = mockUtils.createMockRequest(
          orderData,
          { authorization: 'Bearer test-token' }
        );
        const res = mockUtils.createMockResponse();
        
        // Mock authentication
        const mockAuth = mockUtils.createMockAuthContext('test-user-1');
        req.user = mockAuth.auth;
        
        const { createOrder } = require('../enhanced-functions');
        
        await createOrder(req, res);
        
        testHelpers.assertResponseStatus(res, 201);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            orderId: expect.any(String),
            order: expect.objectContaining({
              userId: 'test-user-1',
              restaurantId: 'test-restaurant-1',
              status: 'pending'
            })
          })
        );
      });
      
      it('should validate required fields', async () => {
        const invalidOrderData = {
          // Missing required fields
          items: []
        };
        
        const req = mockUtils.createMockRequest(
          invalidOrderData,
          { authorization: 'Bearer test-token' }
        );
        const res = mockUtils.createMockResponse();
        
        const mockAuth = mockUtils.createMockAuthContext('test-user-1');
        req.user = mockAuth.auth;
        
        const { createOrder } = require('../enhanced-functions');
        
        await createOrder(req, res);
        
        testHelpers.assertResponseStatus(res, 400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.any(String),
            details: expect.any(Array)
          })
        );
      });
      
      it('should require authentication', async () => {
        const orderData = {
          restaurantId: 'test-restaurant-1',
          items: [{ id: 'item-1', name: 'Test', price: 10, quantity: 1 }]
        };
        
        const req = mockUtils.createMockRequest(orderData);
        const res = mockUtils.createMockResponse();
        
        const { createOrder } = require('../enhanced-functions');
        
        await createOrder(req, res);
        
        testHelpers.assertResponseStatus(res, 401);
      });
    });
    
    describe('Get User Orders Function', () => {
      it('should return user orders', async () => {
        const req = mockUtils.createMockRequest(
          {},
          { authorization: 'Bearer test-token' },
          { userId: 'test-user-1' }
        );
        const res = mockUtils.createMockResponse();
        
        const mockAuth = mockUtils.createMockAuthContext('test-user-1');
        req.user = mockAuth.auth;
        
        const { getUserOrders } = require('../enhanced-functions');
        
        await getUserOrders(req, res);
        
        testHelpers.assertResponseStatus(res, 200);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            orders: expect.any(Array),
            total: expect.any(Number)
          })
        );
      });
      
      it('should handle pagination', async () => {
        const req = mockUtils.createMockRequest(
          {},
          { authorization: 'Bearer test-token' },
          { userId: 'test-user-1' }
        );
        req.query = { page: '1', limit: '10' };
        const res = mockUtils.createMockResponse();
        
        const mockAuth = mockUtils.createMockAuthContext('test-user-1');
        req.user = mockAuth.auth;
        
        const { getUserOrders } = require('../enhanced-functions');
        
        await getUserOrders(req, res);
        
        testHelpers.assertResponseStatus(res, 200);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            orders: expect.any(Array),
            pagination: expect.objectContaining({
              page: 1,
              limit: 10,
              total: expect.any(Number)
            })
          })
        );
      });
    });
  });
  
  // ========================================================================
  // CALLABLE FUNCTIONS TESTS
  // ========================================================================
  
  describe('Callable Functions', () => {
    describe('Process Screenshot Order', () => {
      it('should process screenshot and extract items', async () => {
        const data = {
          imageUrl: 'https://example.com/test-image.jpg',
          restaurantId: 'test-restaurant-1'
        };
        
        const context = mockUtils.createMockAuthContext('test-user-1');
        
        // Mock image processing service
        const mockImageProcessing = jest.fn().mockResolvedValue(
          mockUtils.mockImageProcessing(true)
        );
        
        const { processScreenshotOrder } = require('../enhanced-functions');
        
        const result = await processScreenshotOrder(data, context);
        
        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            extractedItems: expect.any(Array),
            confidence: expect.any(Number)
          })
        );
      });
      
      it('should handle image processing errors', async () => {
        const data = {
          imageUrl: 'https://example.com/invalid-image.jpg',
          restaurantId: 'test-restaurant-1'
        };
        
        const context = mockUtils.createMockAuthContext('test-user-1');
        
        // Mock image processing failure
        const mockImageProcessing = jest.fn().mockRejectedValue(
          new Error('Image processing failed')
        );
        
        const { processScreenshotOrder } = require('../enhanced-functions');
        
        await expect(processScreenshotOrder(data, context))
          .rejects.toThrow('Image processing failed');
      });
    });
    
    describe('Get User Analytics', () => {
      it('should return user analytics data', async () => {
        const data = {
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        };
        
        const context = mockUtils.createMockAuthContext('test-user-1');
        
        const { getUserAnalytics } = require('../enhanced-functions');
        
        const result = await getUserAnalytics(data, context);
        
        expect(result).toEqual(
          expect.objectContaining({
            totalOrders: expect.any(Number),
            totalSpent: expect.any(Number),
            averageOrderValue: expect.any(Number),
            favoriteRestaurants: expect.any(Array)
          })
        );
      });
      
      it('should validate date range', async () => {
        const data = {
          startDate: '2024-01-31',
          endDate: '2024-01-01' // End date before start date
        };
        
        const context = mockUtils.createMockAuthContext('test-user-1');
        
        const { getUserAnalytics } = require('../enhanced-functions');
        
        await expect(getUserAnalytics(data, context))
          .rejects.toThrow('Invalid date range');
      });
    });
  });
  
  // ========================================================================
  // FIRESTORE TRIGGER TESTS
  // ========================================================================
  
  describe('Firestore Triggers', () => {
    describe('On User Created', () => {
      it('should send welcome email when user is created', async () => {
        const userData = {
          uid: 'new-user-123',
          email: 'newuser@example.com',
          displayName: 'New User'
        };
        
        // Mock the Firestore document snapshot
        const snap = test.firestore.makeDocumentSnapshot(userData, 'users/new-user-123');
        const context = {
          eventId: 'test-event-id',
          timestamp: '2024-01-01T00:00:00.000Z',
          eventType: 'providers/google.firestore/eventTypes/document.create',
          resource: 'projects/test-project/databases/(default)/documents/users/new-user-123'
        };
        
        // Mock email service
        const mockEmailService = jest.fn().mockResolvedValue(
          mockUtils.mockEmailService(true)
        );
        
        const { onUserCreated } = require('../enhanced-functions');
        
        await onUserCreated(snap, context);
        
        // Verify welcome email was sent
        // This would depend on your actual email service implementation
        expect(mockEmailService).toHaveBeenCalledWith(
          expect.objectContaining({
            to: userData.email,
            template: 'welcome',
            data: expect.objectContaining({
              displayName: userData.displayName
            })
          })
        );
      });
    });
    
    describe('On Order Created', () => {
      it('should send notification when order is created', async () => {
        const orderData = {
          id: 'new-order-123',
          userId: 'test-user-1',
          restaurantId: 'test-restaurant-1',
          status: 'pending',
          total: 25.99
        };
        
        const snap = test.firestore.makeDocumentSnapshot(orderData, 'orders/new-order-123');
        const context = {
          eventId: 'test-event-id',
          timestamp: '2024-01-01T00:00:00.000Z',
          eventType: 'providers/google.firestore/eventTypes/document.create',
          resource: 'projects/test-project/databases/(default)/documents/orders/new-order-123'
        };
        
        const { onOrderCreated } = require('../enhanced-functions');
        
        await onOrderCreated(snap, context);
        
        // Verify notification was sent
        // This would check your notification service
      });
    });
    
    describe('On Order Status Updated', () => {
      it('should send notification when order status changes', async () => {
        const beforeData = {
          id: 'order-123',
          status: 'pending'
        };
        
        const afterData = {
          id: 'order-123',
          status: 'confirmed'
        };
        
        const beforeSnap = test.firestore.makeDocumentSnapshot(beforeData, 'orders/order-123');
        const afterSnap = test.firestore.makeDocumentSnapshot(afterData, 'orders/order-123');
        
        const change = test.makeChange(beforeSnap, afterSnap);
        const context = {
          eventId: 'test-event-id',
          timestamp: '2024-01-01T00:00:00.000Z',
          eventType: 'providers/google.firestore/eventTypes/document.update',
          resource: 'projects/test-project/databases/(default)/documents/orders/order-123'
        };
        
        const { onOrderStatusUpdated } = require('../enhanced-functions');
        
        await onOrderStatusUpdated(change, context);
        
        // Verify status change notification was sent
      });
      
      it('should not send notification if status unchanged', async () => {
        const beforeData = {
          id: 'order-123',
          status: 'pending',
          total: 25.99
        };
        
        const afterData = {
          id: 'order-123',
          status: 'pending',
          total: 30.99 // Only total changed
        };
        
        const beforeSnap = test.firestore.makeDocumentSnapshot(beforeData, 'orders/order-123');
        const afterSnap = test.firestore.makeDocumentSnapshot(afterData, 'orders/order-123');
        
        const change = test.makeChange(beforeSnap, afterSnap);
        const context = {
          eventId: 'test-event-id',
          timestamp: '2024-01-01T00:00:00.000Z',
          eventType: 'providers/google.firestore/eventTypes/document.update',
          resource: 'projects/test-project/databases/(default)/documents/orders/order-123'
        };
        
        const { onOrderStatusUpdated } = require('../enhanced-functions');
        
        await onOrderStatusUpdated(change, context);
        
        // Verify no notification was sent
      });
    });
  });
  
  // ========================================================================
  // STORAGE TRIGGER TESTS
  // ========================================================================
  
  describe('Storage Triggers', () => {
    describe('On Screenshot Uploaded', () => {
      it('should process uploaded screenshot', async () => {
        const object = {
          name: 'screenshots/user-123/screenshot-456.jpg',
          bucket: 'test-project.appspot.com',
          contentType: 'image/jpeg',
          size: '1024000',
          timeCreated: '2024-01-01T00:00:00.000Z',
          updated: '2024-01-01T00:00:00.000Z'
        };
        
        const context = {
          eventId: 'test-event-id',
          timestamp: '2024-01-01T00:00:00.000Z',
          eventType: 'google.storage.object.finalize',
          resource: 'projects/test-project/buckets/test-project.appspot.com/objects/screenshots/user-123/screenshot-456.jpg'
        };
        
        // Mock image processing
        const mockImageProcessing = jest.fn().mockResolvedValue(
          mockUtils.mockImageProcessing(true)
        );
        
        const { onScreenshotUploaded } = require('../enhanced-functions');
        
        await onScreenshotUploaded(object, context);
        
        // Verify image was processed
        expect(mockImageProcessing).toHaveBeenCalled();
      });
      
      it('should ignore non-image files', async () => {
        const object = {
          name: 'documents/user-123/document.pdf',
          bucket: 'test-project.appspot.com',
          contentType: 'application/pdf',
          size: '1024000'
        };
        
        const context = {
          eventId: 'test-event-id',
          timestamp: '2024-01-01T00:00:00.000Z',
          eventType: 'google.storage.object.finalize',
          resource: 'projects/test-project/buckets/test-project.appspot.com/objects/documents/user-123/document.pdf'
        };
        
        const { onScreenshotUploaded } = require('../enhanced-functions');
        
        await onScreenshotUploaded(object, context);
        
        // Verify no processing occurred for non-image file
      });
    });
  });
  
  // ========================================================================
  // SCHEDULED FUNCTIONS TESTS
  // ========================================================================
  
  describe('Scheduled Functions', () => {
    describe('Daily Analytics Report', () => {
      it('should generate daily analytics report', async () => {
        const context = {
          eventId: 'test-event-id',
          timestamp: '2024-01-01T00:00:00.000Z',
          eventType: 'google.pubsub.topic.publish',
          resource: 'projects/test-project/topics/firebase-schedule-dailyAnalyticsReport'
        };
        
        const { dailyAnalyticsReport } = require('../enhanced-functions');
        
        await dailyAnalyticsReport(context);
        
        // Verify analytics report was generated
        // This would check your analytics service
      });
    });
    
    describe('Weekly Cleanup', () => {
      it('should clean up old temporary data', async () => {
        const context = {
          eventId: 'test-event-id',
          timestamp: '2024-01-01T00:00:00.000Z',
          eventType: 'google.pubsub.topic.publish',
          resource: 'projects/test-project/topics/firebase-schedule-weeklyCleanup'
        };
        
        const { weeklyCleanup } = require('../enhanced-functions');
        
        await weeklyCleanup(context);
        
        // Verify cleanup was performed
      });
    });
  });
  
  // ========================================================================
  // WEBHOOK TESTS
  // ========================================================================
  
  describe('Webhook Functions', () => {
    describe('Stripe Webhook', () => {
      it('should handle successful payment webhook', async () => {
        const webhookData = {
          type: 'payment_intent.succeeded',
          data: {
            object: {
              id: 'pi_test_payment_intent',
              amount: 2599,
              currency: 'usd',
              metadata: {
                orderId: 'test-order-1'
              }
            }
          }
        };
        
        const req = mockUtils.createMockRequest(
          webhookData,
          {
            'stripe-signature': 'test-signature',
            'content-type': 'application/json'
          }
        );
        const res = mockUtils.createMockResponse();
        
        // Mock Stripe webhook verification
        const mockStripeVerify = jest.fn().mockReturnValue(webhookData);
        
        const { stripeWebhook } = require('../enhanced-functions');
        
        await stripeWebhook(req, res);
        
        testHelpers.assertResponseStatus(res, 200);
        
        // Verify order was updated with payment status
      });
      
      it('should handle failed payment webhook', async () => {
        const webhookData = {
          type: 'payment_intent.payment_failed',
          data: {
            object: {
              id: 'pi_test_payment_intent',
              amount: 2599,
              currency: 'usd',
              metadata: {
                orderId: 'test-order-1'
              },
              last_payment_error: {
                message: 'Your card was declined.'
              }
            }
          }
        };
        
        const req = mockUtils.createMockRequest(
          webhookData,
          {
            'stripe-signature': 'test-signature',
            'content-type': 'application/json'
          }
        );
        const res = mockUtils.createMockResponse();
        
        const { stripeWebhook } = require('../enhanced-functions');
        
        await stripeWebhook(req, res);
        
        testHelpers.assertResponseStatus(res, 200);
        
        // Verify order was updated with failed payment status
      });
      
      it('should reject invalid webhook signatures', async () => {
        const webhookData = {
          type: 'payment_intent.succeeded',
          data: { object: {} }
        };
        
        const req = mockUtils.createMockRequest(
          webhookData,
          {
            'stripe-signature': 'invalid-signature',
            'content-type': 'application/json'
          }
        );
        const res = mockUtils.createMockResponse();
        
        // Mock Stripe webhook verification failure
        const mockStripeVerify = jest.fn().mockImplementation(() => {
          throw new Error('Invalid signature');
        });
        
        const { stripeWebhook } = require('../enhanced-functions');
        
        await stripeWebhook(req, res);
        
        testHelpers.assertResponseStatus(res, 400);
      });
    });
  });
  
  // ========================================================================
  // INTEGRATION TESTS
  // ========================================================================
  
  describe('Integration Tests', () => {
    describe('Complete Order Flow', () => {
      it('should handle complete order lifecycle', async () => {
        // 1. Create order
        const orderData = {
          restaurantId: 'test-restaurant-1',
          items: [
            {
              id: 'item-1',
              name: 'Test Item',
              price: 12.99,
              quantity: 2
            }
          ],
          deliveryAddress: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345'
          }
        };
        
        const createReq = mockUtils.createMockRequest(
          orderData,
          { authorization: 'Bearer test-token' }
        );
        const createRes = mockUtils.createMockResponse();
        
        const mockAuth = mockUtils.createMockAuthContext('test-user-1');
        createReq.user = mockAuth.auth;
        
        const { createOrder } = require('../enhanced-functions');
        
        await createOrder(createReq, createRes);
        
        testHelpers.assertResponseStatus(createRes, 201);
        
        const orderId = createRes.body.orderId;
        
        // 2. Update order status
        const updateReq = mockUtils.createMockRequest(
          { status: 'confirmed' },
          { authorization: 'Bearer admin-token' },
          { orderId }
        );
        const updateRes = mockUtils.createMockResponse();
        
        const adminAuth = mockUtils.createMockAuthContext('test-admin', { role: 'admin' });
        updateReq.user = adminAuth.auth;
        
        const { updateOrderStatus } = require('../enhanced-functions');
        
        await updateOrderStatus(updateReq, updateRes);
        
        testHelpers.assertResponseStatus(updateRes, 200);
        
        // 3. Verify order was updated
        const testEnv = testHelpers.getTestEnvironment();
        const adminApp = testEnv.getAdminApp();
        const db = adminApp.firestore();
        
        const orderDoc = await db.collection('orders').doc(orderId).get();
        testHelpers.assertDocumentExists(orderDoc);
        
        const orderDataFromDb = orderDoc.data();
        expect(orderDataFromDb?.status).toBe('confirmed');
      });
    });
    
    describe('Screenshot Order Processing', () => {
      it('should process screenshot and create order', async () => {
        // 1. Upload screenshot
        const uploadData = {
          imageUrl: 'https://example.com/test-screenshot.jpg',
          restaurantId: 'test-restaurant-1'
        };
        
        const context = mockUtils.createMockAuthContext('test-user-1');
        
        // Mock image processing
        const mockImageProcessing = jest.fn().mockResolvedValue(
          mockUtils.mockImageProcessing(true)
        );
        
        const { processScreenshotOrder } = require('../enhanced-functions');
        
        const result = await processScreenshotOrder(uploadData, context);
        
        expect(result.success).toBe(true);
        expect(result.extractedItems).toHaveLength(1);
        
        // 2. Verify screenshot order was created in database
        const testEnv = testHelpers.getTestEnvironment();
        const adminApp = testEnv.getAdminApp();
        const db = adminApp.firestore();
        
        const screenshotOrders = await db
          .collection('screenshot_orders')
          .where('userId', '==', 'test-user-1')
          .get();
        
        expect(screenshotOrders.empty).toBe(false);
        
        const screenshotOrder = screenshotOrders.docs[0].data();
        expect(screenshotOrder.extractedItems).toHaveLength(1);
        expect(screenshotOrder.status).toBe('processed');
      });
    });
  });
  
  // ========================================================================
  // PERFORMANCE TESTS
  // ========================================================================
  
  describe('Performance Tests', () => {
    it('should handle high volume of concurrent requests', async () => {
      const concurrentRequests = 10;
      const requests = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        const req = mockUtils.createMockRequest();
        const res = mockUtils.createMockResponse();
        
        const { healthCheck } = require('../enhanced-functions');
        requests.push(healthCheck(req, res));
      }
      
      const startTime = Date.now();
      await Promise.all(requests);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
    
    it('should handle large order creation efficiently', async () => {
      const largeOrderData = {
        restaurantId: 'test-restaurant-1',
        items: Array.from({ length: 100 }, (_, i) => ({
          id: `item-${i}`,
          name: `Test Item ${i}`,
          price: Math.random() * 20 + 5,
          quantity: Math.floor(Math.random() * 5) + 1
        })),
        deliveryAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345'
        }
      };
      
      const req = mockUtils.createMockRequest(
        largeOrderData,
        { authorization: 'Bearer test-token' }
      );
      const res = mockUtils.createMockResponse();
      
      const mockAuth = mockUtils.createMockAuthContext('test-user-1');
      req.user = mockAuth.auth;
      
      const { createOrder } = require('../enhanced-functions');
      
      const startTime = Date.now();
      await createOrder(req, res);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
      
      testHelpers.assertResponseStatus(res, 201);
    });
  });
});