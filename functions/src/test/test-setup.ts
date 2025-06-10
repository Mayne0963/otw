/**
 * Comprehensive Testing Setup for Firebase Cloud Functions
 * Includes unit tests, integration tests, mocking utilities, and test data
 */

import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import * as admin from 'firebase-admin';
import { createLogger } from '../utils/logger';

// ========================================================================
// TEST CONFIGURATION
// ========================================================================

export interface TestConfig {
  projectId: string;
  emulators: {
    firestore: { host: string; port: number };
    auth: { host: string; port: number };
    storage: { host: string; port: number };
    functions: { host: string; port: number };
  };
  testData: {
    users: any[];
    orders: any[];
    restaurants: any[];
  };
}

const TEST_CONFIG: TestConfig = {
  projectId: 'test-project-id',
  emulators: {
    firestore: { host: 'localhost', port: 8080 },
    auth: { host: 'localhost', port: 9099 },
    storage: { host: 'localhost', port: 9199 },
    functions: { host: 'localhost', port: 5001 }
  },
  testData: {
    users: [
      {
        uid: 'test-user-1',
        email: 'test1@example.com',
        displayName: 'Test User 1',
        role: 'customer',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        uid: 'test-user-2',
        email: 'test2@example.com',
        displayName: 'Test User 2',
        role: 'restaurant_owner',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        uid: 'test-admin',
        email: 'admin@example.com',
        displayName: 'Test Admin',
        role: 'admin',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ],
    orders: [
      {
        id: 'test-order-1',
        userId: 'test-user-1',
        restaurantId: 'test-restaurant-1',
        status: 'pending',
        items: [
          {
            id: 'item-1',
            name: 'Test Item 1',
            price: 12.99,
            quantity: 2
          }
        ],
        total: 25.98,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ],
    restaurants: [
      {
        id: 'test-restaurant-1',
        name: 'Test Restaurant',
        ownerId: 'test-user-2',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345'
        },
        cuisine: 'test',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ]
  }
};

// ========================================================================
// TEST ENVIRONMENT SETUP
// ========================================================================

export class TestEnvironment {
  private static instance: TestEnvironment;
  private rulesTestEnv: RulesTestEnvironment | null = null;
  private adminApp: admin.app.App | null = null;
  private clientApp: any = null;
  private logger = createLogger('TestEnvironment');
  
  private constructor() {}
  
  static getInstance(): TestEnvironment {
    if (!TestEnvironment.instance) {
      TestEnvironment.instance = new TestEnvironment();
    }
    return TestEnvironment.instance;
  }
  
  async setup(): Promise<void> {
    this.logger.info('Setting up test environment');
    
    try {
      // Initialize Firebase Rules Test Environment
      this.rulesTestEnv = await initializeTestEnvironment({
        projectId: TEST_CONFIG.projectId,
        firestore: {
          host: TEST_CONFIG.emulators.firestore.host,
          port: TEST_CONFIG.emulators.firestore.port
        },
        storage: {
          host: TEST_CONFIG.emulators.storage.host,
          port: TEST_CONFIG.emulators.storage.port
        }
      });
      
      // Initialize Admin SDK
      this.adminApp = admin.initializeApp({
        projectId: TEST_CONFIG.projectId
      }, 'test-admin');
      
      // Initialize Client SDK
      this.clientApp = initializeApp({
        projectId: TEST_CONFIG.projectId,
        authDomain: `${TEST_CONFIG.projectId}.firebaseapp.com`,
        storageBucket: `${TEST_CONFIG.projectId}.appspot.com`
      }, 'test-client');
      
      // Connect to emulators
      await this.connectToEmulators();
      
      this.logger.info('Test environment setup completed');
    } catch (error) {
      this.logger.error('Failed to setup test environment', error as Error);
      throw error;
    }
  }
  
  private async connectToEmulators(): Promise<void> {
    const firestore = getFirestore(this.clientApp);
    const auth = getAuth(this.clientApp);
    const storage = getStorage(this.clientApp);
    
    connectFirestoreEmulator(
      firestore,
      TEST_CONFIG.emulators.firestore.host,
      TEST_CONFIG.emulators.firestore.port
    );
    
    connectAuthEmulator(
      auth,
      `http://${TEST_CONFIG.emulators.auth.host}:${TEST_CONFIG.emulators.auth.port}`
    );
    
    connectStorageEmulator(
      storage,
      TEST_CONFIG.emulators.storage.host,
      TEST_CONFIG.emulators.storage.port
    );
  }
  
  async cleanup(): Promise<void> {
    this.logger.info('Cleaning up test environment');
    
    try {
      if (this.rulesTestEnv) {
        await this.rulesTestEnv.cleanup();
      }
      
      if (this.adminApp) {
        await this.adminApp.delete();
      }
      
      this.logger.info('Test environment cleanup completed');
    } catch (error) {
      this.logger.error('Failed to cleanup test environment', error as Error);
    }
  }
  
  async clearFirestore(): Promise<void> {
    if (this.rulesTestEnv) {
      await this.rulesTestEnv.clearFirestore();
    }
  }
  
  async clearStorage(): Promise<void> {
    if (this.rulesTestEnv) {
      await this.rulesTestEnv.clearStorage();
    }
  }
  
  getAdminApp(): admin.app.App {
    if (!this.adminApp) {
      throw new Error('Admin app not initialized. Call setup() first.');
    }
    return this.adminApp;
  }
  
  getClientApp(): any {
    if (!this.clientApp) {
      throw new Error('Client app not initialized. Call setup() first.');
    }
    return this.clientApp;
  }
  
  getRulesTestEnv(): RulesTestEnvironment {
    if (!this.rulesTestEnv) {
      throw new Error('Rules test environment not initialized. Call setup() first.');
    }
    return this.rulesTestEnv;
  }
}

// ========================================================================
// TEST DATA UTILITIES
// ========================================================================

export class TestDataManager {
  private testEnv: TestEnvironment;
  private logger = createLogger('TestDataManager');
  
  constructor(testEnv: TestEnvironment) {
    this.testEnv = testEnv;
  }
  
  async seedTestData(): Promise<void> {
    this.logger.info('Seeding test data');
    
    const adminApp = this.testEnv.getAdminApp();
    const db = adminApp.firestore();
    
    try {
      // Seed users
      for (const user of TEST_CONFIG.testData.users) {
        await db.collection('users').doc(user.uid).set({
          ...user,
          createdAt: admin.firestore.Timestamp.fromDate(user.createdAt),
          updatedAt: admin.firestore.Timestamp.fromDate(user.updatedAt)
        });
      }
      
      // Seed restaurants
      for (const restaurant of TEST_CONFIG.testData.restaurants) {
        await db.collection('restaurants').doc(restaurant.id).set({
          ...restaurant,
          createdAt: admin.firestore.Timestamp.fromDate(restaurant.createdAt),
          updatedAt: admin.firestore.Timestamp.fromDate(restaurant.updatedAt)
        });
      }
      
      // Seed orders
      for (const order of TEST_CONFIG.testData.orders) {
        await db.collection('orders').doc(order.id).set({
          ...order,
          createdAt: admin.firestore.Timestamp.fromDate(order.createdAt),
          updatedAt: admin.firestore.Timestamp.fromDate(order.updatedAt)
        });
      }
      
      this.logger.info('Test data seeded successfully');
    } catch (error) {
      this.logger.error('Failed to seed test data', error as Error);
      throw error;
    }
  }
  
  async createTestUser(userData: Partial<any> = {}): Promise<any> {
    const defaultUser = {
      uid: `test-user-${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      displayName: 'Test User',
      role: 'customer',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const user = { ...defaultUser, ...userData };
    
    const adminApp = this.testEnv.getAdminApp();
    const db = adminApp.firestore();
    
    await db.collection('users').doc(user.uid).set({
      ...user,
      createdAt: admin.firestore.Timestamp.fromDate(user.createdAt),
      updatedAt: admin.firestore.Timestamp.fromDate(user.updatedAt)
    });
    
    return user;
  }
  
  async createTestOrder(orderData: Partial<any> = {}): Promise<any> {
    const defaultOrder = {
      id: `test-order-${Date.now()}`,
      userId: 'test-user-1',
      restaurantId: 'test-restaurant-1',
      status: 'pending',
      items: [
        {
          id: 'item-1',
          name: 'Test Item',
          price: 10.00,
          quantity: 1
        }
      ],
      total: 10.00,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const order = { ...defaultOrder, ...orderData };
    
    const adminApp = this.testEnv.getAdminApp();
    const db = adminApp.firestore();
    
    await db.collection('orders').doc(order.id).set({
      ...order,
      createdAt: admin.firestore.Timestamp.fromDate(order.createdAt),
      updatedAt: admin.firestore.Timestamp.fromDate(order.updatedAt)
    });
    
    return order;
  }
  
  async createTestRestaurant(restaurantData: Partial<any> = {}): Promise<any> {
    const defaultRestaurant = {
      id: `test-restaurant-${Date.now()}`,
      name: 'Test Restaurant',
      ownerId: 'test-user-2',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345'
      },
      cuisine: 'test',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const restaurant = { ...defaultRestaurant, ...restaurantData };
    
    const adminApp = this.testEnv.getAdminApp();
    const db = adminApp.firestore();
    
    await db.collection('restaurants').doc(restaurant.id).set({
      ...restaurant,
      createdAt: admin.firestore.Timestamp.fromDate(restaurant.createdAt),
      updatedAt: admin.firestore.Timestamp.fromDate(restaurant.updatedAt)
    });
    
    return restaurant;
  }
}

// ========================================================================
// MOCK UTILITIES
// ========================================================================

export class MockUtilities {
  private logger = createLogger('MockUtilities');
  
  // Mock HTTP request
  createMockRequest(data: any = {}, headers: any = {}, params: any = {}): any {
    return {
      body: data,
      headers: {
        'content-type': 'application/json',
        ...headers
      },
      params,
      query: {},
      method: 'POST',
      url: '/test',
      get: (header: string) => headers[header.toLowerCase()],
      ...data
    };
  }
  
  // Mock HTTP response
  createMockResponse(): any {
    const response: any = {
      statusCode: 200,
      headers: {},
      body: null,
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis()
    };
    
    response.status.mockImplementation((code: number) => {
      response.statusCode = code;
      return response;
    });
    
    response.json.mockImplementation((data: any) => {
      response.body = data;
      return response;
    });
    
    response.send.mockImplementation((data: any) => {
      response.body = data;
      return response;
    });
    
    return response;
  }
  
  // Mock Firebase Auth context
  createMockAuthContext(uid: string = 'test-user', claims: any = {}): any {
    return {
      auth: {
        uid,
        token: {
          uid,
          email: `${uid}@example.com`,
          ...claims
        }
      }
    };
  }
  
  // Mock Firestore document
  createMockFirestoreDoc(data: any, exists: boolean = true): any {
    return {
      exists,
      data: () => exists ? data : undefined,
      id: data?.id || 'test-doc-id',
      ref: {
        path: `test-collection/${data?.id || 'test-doc-id'}`
      }
    };
  }
  
  // Mock external API responses
  mockStripePayment(success: boolean = true): any {
    if (success) {
      return {
        id: 'pi_test_payment_intent',
        status: 'succeeded',
        amount: 1000,
        currency: 'usd',
        client_secret: 'pi_test_client_secret'
      };
    } else {
      throw new Error('Payment failed');
    }
  }
  
  mockEmailService(success: boolean = true): any {
    if (success) {
      return {
        messageId: 'test-message-id',
        status: 'sent'
      };
    } else {
      throw new Error('Email sending failed');
    }
  }
  
  mockImageProcessing(success: boolean = true): any {
    if (success) {
      return {
        extractedText: 'Test extracted text',
        confidence: 0.95,
        items: [
          {
            name: 'Test Item',
            price: 10.00,
            quantity: 1
          }
        ]
      };
    } else {
      throw new Error('Image processing failed');
    }
  }
}

// ========================================================================
// TEST HELPERS
// ========================================================================

export class TestHelpers {
  private testEnv: TestEnvironment;
  private dataManager: TestDataManager;
  private mockUtils: MockUtilities;
  private logger = createLogger('TestHelpers');
  
  constructor() {
    this.testEnv = TestEnvironment.getInstance();
    this.dataManager = new TestDataManager(this.testEnv);
    this.mockUtils = new MockUtilities();
  }
  
  async setupTest(): Promise<void> {
    await this.testEnv.setup();
    await this.testEnv.clearFirestore();
    await this.testEnv.clearStorage();
    await this.dataManager.seedTestData();
  }
  
  async teardownTest(): Promise<void> {
    await this.testEnv.cleanup();
  }
  
  getTestEnvironment(): TestEnvironment {
    return this.testEnv;
  }
  
  getDataManager(): TestDataManager {
    return this.dataManager;
  }
  
  getMockUtils(): MockUtilities {
    return this.mockUtils;
  }
  
  // Wait for async operations
  async waitFor(condition: () => Promise<boolean>, timeout: number = 5000): Promise<void> {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      if (await condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }
  
  // Assert helpers
  assertResponseStatus(response: any, expectedStatus: number): void {
    expect(response.statusCode).toBe(expectedStatus);
  }
  
  assertResponseBody(response: any, expectedBody: any): void {
    expect(response.body).toEqual(expectedBody);
  }
  
  assertDocumentExists(doc: any): void {
    expect(doc.exists).toBe(true);
  }
  
  assertDocumentNotExists(doc: any): void {
    expect(doc.exists).toBe(false);
  }
}

// ========================================================================
// JEST SETUP
// ========================================================================

// Global test setup
beforeAll(async () => {
  const helpers = new TestHelpers();
  await helpers.setupTest();
  
  // Make helpers available globally
  (global as any).testHelpers = helpers;
});

// Global test teardown
afterAll(async () => {
  const helpers = (global as any).testHelpers;
  if (helpers) {
    await helpers.teardownTest();
  }
});

// Clear data between tests
beforeEach(async () => {
  const helpers = (global as any).testHelpers;
  if (helpers) {
    const testEnv = helpers.getTestEnvironment();
    await testEnv.clearFirestore();
    await testEnv.clearStorage();
    
    const dataManager = helpers.getDataManager();
    await dataManager.seedTestData();
  }
});

// ========================================================================
// EXPORTS
// ========================================================================

export {
  TEST_CONFIG,
  TestEnvironment,
  TestDataManager,
  MockUtilities,
  TestHelpers
};

export default {
  TEST_CONFIG,
  TestEnvironment,
  TestDataManager,
  MockUtilities,
  TestHelpers
};