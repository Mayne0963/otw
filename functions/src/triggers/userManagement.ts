import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as functionsV2 from 'firebase-functions/v2';

const db = admin.firestore();

/**
 * User management functions for handling user lifecycle events
 */
export const userManagement = {
  /**
   * Trigger when a new user is created in Firebase Auth
   * Creates user profile in Firestore and sends welcome email
   */
  onUserCreated: functions.auth.user().onCreate(async (user) => {
    try {
      console.log(`New user created: ${user.uid}`);
      
      // Create user profile in Firestore
      const userProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        emailVerified: user.emailVerified,
        phoneNumber: user.phoneNumber || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        // Initialize user stats
        orderCount: 0,
        totalSpent: 0,
        completedOrderCount: 0,
        loyaltyPoints: 0,
        tier: 'bronze',
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          dietary: [],
          favoriteRestaurants: [],
        },
        addresses: [],
        paymentMethods: [],
      };
      
      await db.collection('users').doc(user.uid).set(userProfile);
      
      // Initialize user analytics document
      await db.collection('user_analytics').doc(user.uid).set({
        userId: user.uid,
        signupDate: admin.firestore.FieldValue.serverTimestamp(),
        lastLoginDate: admin.firestore.FieldValue.serverTimestamp(),
        loginCount: 1,
        sessionCount: 0,
        averageSessionDuration: 0,
        totalTimeSpent: 0,
        favoriteCategories: [],
        orderFrequency: 0,
        averageOrderValue: 0,
        lastOrderDate: null,
        deviceInfo: {
          platform: null,
          version: null,
          userAgent: null,
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      // Send welcome notification if email exists
      if (user.email) {
        // This would typically integrate with your email service
        console.log(`Welcome email should be sent to: ${user.email}`);
      }
      
      return { success: true, userId: user.uid };
    } catch (error) {
      console.error('Error creating user profile:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }),

  /**
   * Trigger when a user is deleted from Firebase Auth
   * Cleans up user data across all collections
   */
  onUserDeleted: functions.auth.user().onDelete(async (user) => {
    try {
      console.log(`User deleted: ${user.uid}`);
      
      const batch = db.batch();
      
      // Delete user profile
      const userRef = db.collection('users').doc(user.uid);
      batch.delete(userRef);
      
      // Delete user analytics
      const analyticsRef = db.collection('user_analytics').doc(user.uid);
      batch.delete(analyticsRef);
      
      // Find and anonymize user's orders (don't delete for business records)
      const ordersSnapshot = await db.collection('orders')
        .where('userRef', '==', user.uid)
        .get();
      
      ordersSnapshot.forEach((doc) => {
        batch.update(doc.ref, {
          userRef: 'deleted_user',
          customerInfo: {
            name: 'Deleted User',
            email: 'deleted@example.com',
            phone: 'N/A',
          },
          anonymized: true,
          anonymizedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });
      
      // Find and anonymize screenshot orders
      const screenshotOrdersSnapshot = await db.collection('screenshot_orders')
        .where('customerInfo.uid', '==', user.uid)
        .get();
      
      screenshotOrdersSnapshot.forEach((doc) => {
        batch.update(doc.ref, {
          'customerInfo.uid': 'deleted_user',
          'customerInfo.name': 'Deleted User',
          'customerInfo.email': 'deleted@example.com',
          'customerInfo.phone': 'N/A',
          anonymized: true,
          anonymizedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });
      
      // Delete user's uploaded files from Storage
      const bucket = admin.storage().bucket();
      const [files] = await bucket.getFiles({
        prefix: `users/${user.uid}/`,
      });
      
      const deletePromises = files.map(file => file.delete());
      await Promise.all(deletePromises);
      
      // Commit all changes
      await batch.commit();
      
      console.log(`Successfully cleaned up data for user: ${user.uid}`);
      return { success: true, userId: user.uid };
    } catch (error) {
      console.error('Error deleting user data:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }),

  /**
   * Update user profile with validation and analytics tracking
   */
  updateUserProfile: functionsV2.https.onCall(async (request) => {
    // Ensure user is authenticated
    if (!request.auth) {
      throw new functionsV2.https.HttpsError(
        'unauthenticated',
        'You must be logged in to update your profile.'
      );
    }
    
    const userId = request.auth.uid;
    const { data } = request;
    const { updates } = data;
    
    if (!updates || typeof updates !== 'object') {
      throw new functionsV2.https.HttpsError(
        'invalid-argument',
        'Updates object is required.'
      );
    }
    
    try {
      // Validate and sanitize updates
      const allowedFields = [
        'displayName',
        'phoneNumber',
        'preferences',
        'addresses',
        'dietary',
        'favoriteRestaurants',
      ];
      
      const sanitizedUpdates: any = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      
      // Only allow updates to specific fields
      Object.keys(updates).forEach((key) => {
        if (allowedFields.includes(key)) {
          sanitizedUpdates[key] = updates[key];
        }
      });
      
      // Update user profile
      await db.collection('users').doc(userId).update(sanitizedUpdates);
      
      // Track profile update in analytics
      await db.collection('user_analytics').doc(userId).update({
        lastProfileUpdate: admin.firestore.FieldValue.serverTimestamp(),
        profileUpdateCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      return { success: true, userId };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new functionsV2.https.HttpsError(
        'internal',
        `Error updating profile: ${(error as Error).message}`
      );
    }
  }),

  /**
   * Get user analytics data
   */
  getUserAnalytics: functionsV2.https.onCall(async (request) => {
    // Ensure user is authenticated
    if (!request.auth) {
      throw new functionsV2.https.HttpsError(
        'unauthenticated',
        'You must be logged in to view analytics.'
      );
    }
    
    const userId = request.auth.uid;
    const { data } = request;
    const { targetUserId } = data;
    
    // Allow users to view their own analytics or admins to view any user's analytics
    const isAdmin = request.auth.token.admin === true;
    const requestedUserId = targetUserId || userId;
    
    if (!isAdmin && requestedUserId !== userId) {
      throw new functionsV2.https.HttpsError(
        'permission-denied',
        'You can only view your own analytics.'
      );
    }
    
    try {
      // Get user profile
      const userDoc = await db.collection('users').doc(requestedUserId).get();
      if (!userDoc.exists) {
        throw new functionsV2.https.HttpsError(
          'not-found',
          'User not found.'
        );
      }
      
      const userData = userDoc.data();
      
      // Get user analytics
      const analyticsDoc = await db.collection('user_analytics').doc(requestedUserId).get();
      const analyticsData = analyticsDoc.exists ? analyticsDoc.data() : {};
      
      // Get recent orders
      const recentOrdersSnapshot = await db.collection('orders')
        .where('userRef', '==', requestedUserId)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();
      
      const recentOrders = recentOrdersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Calculate additional metrics
      const totalOrders = userData?.orderCount || 0;
      const totalSpent = userData?.totalSpent || 0;
      const completedOrders = userData?.completedOrderCount || 0;
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      
      return {
        success: true,
        analytics: {
          profile: {
            displayName: userData?.displayName,
            email: userData?.email,
            tier: userData?.tier,
            loyaltyPoints: userData?.loyaltyPoints,
            memberSince: userData?.createdAt,
          },
          orderStats: {
            totalOrders,
            totalSpent,
            completedOrders,
            averageOrderValue,
            lastOrderDate: userData?.lastOrderDate,
          },
          engagement: {
            loginCount: analyticsData?.loginCount || 0,
            sessionCount: analyticsData?.sessionCount || 0,
            averageSessionDuration: analyticsData?.averageSessionDuration || 0,
            lastLoginDate: analyticsData?.lastLoginDate,
          },
          preferences: {
            favoriteCategories: analyticsData?.favoriteCategories || [],
            favoriteRestaurants: userData?.preferences?.favoriteRestaurants || [],
            dietary: userData?.preferences?.dietary || [],
          },
          recentOrders,
        },
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      throw new functionsV2.https.HttpsError(
        'internal',
        `Error retrieving analytics: ${(error as Error).message}`
      );
    }
  }),

  /**
   * Track user login for analytics
   */
  trackUserLogin: functionsV2.https.onCall(async (request) => {
    if (!request.auth) {
      throw new functionsV2.https.HttpsError(
        'unauthenticated',
        'You must be logged in.'
      );
    }
    
    const userId = request.auth.uid;
    const { data } = request;
    const { deviceInfo, sessionId } = data;
    
    try {
      // Update user analytics
      await db.collection('user_analytics').doc(userId).update({
        lastLoginDate: admin.firestore.FieldValue.serverTimestamp(),
        loginCount: admin.firestore.FieldValue.increment(1),
        deviceInfo: deviceInfo || {},
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      // Create session record
      if (sessionId) {
        await db.collection('user_sessions').doc(sessionId).set({
          userId,
          startTime: admin.firestore.FieldValue.serverTimestamp(),
          deviceInfo: deviceInfo || {},
          active: true,
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error tracking user login:', error);
      throw new functionsV2.https.HttpsError(
        'internal',
        `Error tracking login: ${(error as Error).message}`
      );
    }
  }),
};