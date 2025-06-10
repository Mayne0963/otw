import * as functionsV2 from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// UserEvent interface removed as it was unused

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
export const trackUserEvent = functionsV2.https.onCall(async (request) => {
  // Verify user is authenticated
  if (!request.auth) {
    throw new functionsV2.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;
  const { data } = request;
  const { eventType, eventData, sessionId, userAgent, ipAddress } = data;

  try {
    // Validate required fields
    if (!eventType) {
      throw new functionsV2.https.HttpsError('invalid-argument', 'eventType is required');
    }

    // Create event document
    const eventDoc = {
      userId,
      eventType,
      eventData: eventData || {},
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      sessionId: sessionId || null,
      userAgent: userAgent || null,
      ipAddress: ipAddress || null,
    };

    // Store event in analytics collection
    await db.collection('analytics_events').add(eventDoc);

    // Update user analytics summary
    await updateUserAnalyticsSummary(userId, eventType);

    // Update real-time analytics
    await updateRealTimeAnalytics(eventType, eventData);

    console.log(`Tracked event ${eventType} for user ${userId}`);
    return { success: true, eventType, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('Error tracking user event:', error);
    throw new functionsV2.https.HttpsError('internal', `Failed to track event: ${(error as Error).message}`);
  }
});

/**
 * Generate daily analytics report
 */
export const generateDailyReport = functionsV2.scheduler.onSchedule({
  schedule: '0 1 * * *',
  timeZone: 'America/New_York'
}, async (event) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  try {
    // Calculate daily metrics
    const metrics = await calculateDailyMetrics(yesterday);

    // Store daily report
    const reportDoc = {
      date: yesterday.toISOString().split('T')[0],
      metrics,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('daily_reports').doc(reportDoc.date).set(reportDoc);

    // Update monthly aggregates
    await updateMonthlyAggregates(yesterday, metrics);

    console.log(`Generated daily report for ${reportDoc.date}`);
    // Scheduled functions should not return values
  } catch (error) {
    console.error('Error generating daily report:', error);
    throw error;
  }
});

/**
 * Calculate business metrics
 */
export const calculateBusinessMetrics = functionsV2.https.onCall(async (request) => {
  // Verify user is authenticated and has admin role
  if (!request.auth) {
    throw new functionsV2.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Check if user has admin privileges
  const userDoc = await db.collection('users').doc(request.auth.uid).get();
  if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
    throw new functionsV2.https.HttpsError('permission-denied', 'Admin access required');
  }

  const { data } = request;
  const { period } = data;

  try {
    const metrics = await calculateMetricsForPeriod(period);
    return { success: true, metrics, period };
  } catch (error) {
    console.error('Error calculating business metrics:', error);
    throw new functionsV2.https.HttpsError('internal', `Failed to calculate metrics: ${(error as Error).message}`);
  }
});

/**
 * Update user analytics summary
 */
async function updateUserAnalyticsSummary(userId: string, eventType: string) {
  const userAnalyticsRef = db.collection('user_analytics').doc(userId);
  
  await db.runTransaction(async (transaction) => {
    const userAnalyticsDoc = await transaction.get(userAnalyticsRef);
    
    if (!userAnalyticsDoc.exists) {
      // Create new analytics document
      transaction.set(userAnalyticsRef, {
        userId,
        totalEvents: 1,
        eventCounts: { [eventType]: 1 },
        lastEventAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // Update existing analytics
      transaction.update(userAnalyticsRef, {
        totalEvents: admin.firestore.FieldValue.increment(1),
        [`eventCounts.${eventType}`]: admin.firestore.FieldValue.increment(1),
        lastEventAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });
}

/**
 * Update real-time analytics
 */
async function updateRealTimeAnalytics(eventType: string, eventData: any) {
  const today = new Date().toISOString().split('T')[0];
  const realTimeRef = db.collection('realtime_analytics').doc(today);
  
  await db.runTransaction(async (transaction) => {
    const realTimeDoc = await transaction.get(realTimeRef);
    
    if (!realTimeDoc.exists) {
      transaction.set(realTimeRef, {
        date: today,
        eventCounts: { [eventType]: 1 },
        totalEvents: 1,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      transaction.update(realTimeRef, {
        [`eventCounts.${eventType}`]: admin.firestore.FieldValue.increment(1),
        totalEvents: admin.firestore.FieldValue.increment(1),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });
}

/**
 * Calculate daily metrics
 */
async function calculateDailyMetrics(date: Date): Promise<any> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get daily events
  const eventsSnapshot = await db.collection('analytics_events')
    .where('timestamp', '>=', startOfDay)
    .where('timestamp', '<=', endOfDay)
    .get();

  // Get daily orders
  const ordersSnapshot = await db.collection('orders')
    .where('createdAt', '>=', startOfDay)
    .where('createdAt', '<=', endOfDay)
    .get();

  // Get daily users (new signups)
  const usersSnapshot = await db.collection('users')
    .where('createdAt', '>=', startOfDay)
    .where('createdAt', '<=', endOfDay)
    .get();

  // Calculate metrics
  const totalEvents = eventsSnapshot.size;
  const totalOrders = ordersSnapshot.size;
  const newUsers = usersSnapshot.size;
  
  let totalRevenue = 0;
  let completedOrders = 0;
  
  ordersSnapshot.forEach((doc) => {
    const order = doc.data();
    if (order.status === 'completed' || order.status === 'paid') {
      totalRevenue += order.total || 0;
      completedOrders++;
    }
  });

  // Calculate unique active users
  const uniqueUsers = new Set();
  eventsSnapshot.forEach((doc) => {
    const event = doc.data();
    if (event.userId) {
      uniqueUsers.add(event.userId);
    }
  });

  const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;
  const conversionRate = uniqueUsers.size > 0 ? (completedOrders / uniqueUsers.size) * 100 : 0;

  return {
    totalEvents,
    totalOrders,
    completedOrders,
    newUsers,
    activeUsers: uniqueUsers.size,
    totalRevenue,
    averageOrderValue,
    conversionRate,
    date: date.toISOString().split('T')[0],
  };
}

/**
 * Update monthly aggregates
 */
async function updateMonthlyAggregates(date: Date, dailyMetrics: any) {
  const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  const monthlyRef = db.collection('monthly_analytics').doc(monthKey);
  
  await db.runTransaction(async (transaction) => {
    const monthlyDoc = await transaction.get(monthlyRef);
    
    if (!monthlyDoc.exists) {
      transaction.set(monthlyRef, {
        month: monthKey,
        totalEvents: dailyMetrics.totalEvents,
        totalOrders: dailyMetrics.totalOrders,
        totalRevenue: dailyMetrics.totalRevenue,
        newUsers: dailyMetrics.newUsers,
        daysCount: 1,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      transaction.update(monthlyRef, {
        totalEvents: admin.firestore.FieldValue.increment(dailyMetrics.totalEvents),
        totalOrders: admin.firestore.FieldValue.increment(dailyMetrics.totalOrders),
        totalRevenue: admin.firestore.FieldValue.increment(dailyMetrics.totalRevenue),
        newUsers: admin.firestore.FieldValue.increment(dailyMetrics.newUsers),
        daysCount: admin.firestore.FieldValue.increment(1),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });
}

/**
 * Calculate metrics for a specific period
 */
async function calculateMetricsForPeriod(period: string): Promise<BusinessMetrics> {
  let startDate: Date;
  let endDate = new Date();
  
  switch (period) {
    case 'today':
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      throw new Error('Invalid period specified');
  }

  // Get users count
  const usersSnapshot = await db.collection('users')
    .where('createdAt', '>=', startDate)
    .where('createdAt', '<=', endDate)
    .get();

  // Get orders
  const ordersSnapshot = await db.collection('orders')
    .where('createdAt', '>=', startDate)
    .where('createdAt', '<=', endDate)
    .get();

  // Get active users from events
  const eventsSnapshot = await db.collection('analytics_events')
    .where('timestamp', '>=', startDate)
    .where('timestamp', '<=', endDate)
    .get();

  const activeUsers = new Set();
  eventsSnapshot.forEach((doc) => {
    const event = doc.data();
    if (event.userId) {
      activeUsers.add(event.userId);
    }
  });

  let totalRevenue = 0;
  let completedOrders = 0;
  
  ordersSnapshot.forEach((doc) => {
    const order = doc.data();
    if (order.status === 'completed' || order.status === 'paid') {
      totalRevenue += order.total || 0;
      completedOrders++;
    }
  });

  const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;
  const conversionRate = activeUsers.size > 0 ? (completedOrders / activeUsers.size) * 100 : 0;

  return {
    totalUsers: usersSnapshot.size,
    activeUsers: activeUsers.size,
    totalOrders: ordersSnapshot.size,
    totalRevenue,
    averageOrderValue,
    conversionRate,
    period,
  };
}

export const analyticsService = {
  trackUserEvent,
  generateDailyReport,
  calculateBusinessMetrics,
};