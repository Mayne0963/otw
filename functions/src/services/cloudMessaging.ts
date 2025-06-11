import { messaging } from 'firebase-admin';
import { logger } from 'firebase-functions';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';

interface NotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  clickAction?: string;
  data?: Record<string, string>;
}

interface TopicSubscription {
  userId: string;
  topics: string[];
  preferences: {
    orderUpdates: boolean;
    promotions: boolean;
    events: boolean;
    general: boolean;
  };
}

interface ConditionalMessage {
  condition: string;
  notification: NotificationPayload;
  data?: Record<string, string>;
}

class CloudMessagingService {
  private db = getFirestore();

  /**
   * Send notification to specific device tokens
   * Requires Blaze plan for high volume messaging
   */
  async sendToTokens(
    tokens: string[],
    notification: NotificationPayload,
    data?: Record<string, string>
  ): Promise<messaging.BatchResponse> {
    try {
      const message: messaging.MulticastMessage = {
        tokens,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: {
          ...data,
          clickAction: notification.clickAction || '',
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#FF6B35',
            sound: 'default',
            priority: 'high' as const,
            channelId: 'default',
          },
          data: data,
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body,
              },
              badge: 1,
              sound: 'default',
              'content-available': 1,
            },
          },
          fcmOptions: {
            imageUrl: notification.imageUrl,
          },
        },
        webpush: {
          notification: {
            title: notification.title,
            body: notification.body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            image: notification.imageUrl,
            requireInteraction: true,
            actions: [
              {
                action: 'view',
                title: 'View',
                icon: '/icons/view-icon.png',
              },
              {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '/icons/dismiss-icon.png',
              },
            ],
          },
          fcmOptions: {
            link: notification.clickAction || '/',
          },
        },
      };

      const response = await messaging().sendEachForMulticast(message);
      
      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            logger.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
          }
        });
        
        // Remove invalid tokens from database
        await this.removeInvalidTokens(failedTokens);
      }

      logger.info(`Successfully sent ${response.successCount} messages`);
      return response;
    } catch (error) {
      logger.error('Error sending multicast message:', error);
      throw new HttpsError('internal', 'Failed to send notifications');
    }
  }

  /**
   * Send notification to topic subscribers
   * Requires Blaze plan for topic messaging
   */
  async sendToTopic(
    topic: string,
    notification: NotificationPayload,
    data?: Record<string, string>
  ): Promise<string> {
    try {
      const message: messaging.Message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: {
          ...data,
          clickAction: notification.clickAction || '',
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#FF6B35',
            sound: 'default',
            priority: 'high' as const,
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body,
              },
              sound: 'default',
            },
          },
        },
      };

      const messageId = await messaging().send(message);
      logger.info(`Successfully sent message to topic ${topic}:`, messageId);
      return messageId;
    } catch (error) {
      logger.error(`Error sending message to topic ${topic}:`, error);
      throw new HttpsError('internal', 'Failed to send topic notification');
    }
  }

  /**
   * Send conditional notifications
   * Requires Blaze plan for advanced targeting
   */
  async sendConditionalMessage(
    conditionalMessage: ConditionalMessage
  ): Promise<string> {
    try {
      const message: messaging.Message = {
        condition: conditionalMessage.condition,
        notification: {
          title: conditionalMessage.notification.title,
          body: conditionalMessage.notification.body,
          imageUrl: conditionalMessage.notification.imageUrl,
        },
        data: conditionalMessage.data,
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#FF6B35',
            sound: 'default',
            priority: 'high' as const,
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: conditionalMessage.notification.title,
                body: conditionalMessage.notification.body,
              },
              sound: 'default',
            },
          },
        },
      };

      const messageId = await messaging().send(message);
      logger.info(`Successfully sent conditional message:`, messageId);
      return messageId;
    } catch (error) {
      logger.error('Error sending conditional message:', error);
      throw new HttpsError('internal', 'Failed to send conditional notification');
    }
  }

  /**
   * Subscribe users to topics
   */
  async subscribeToTopics(
    tokens: string[],
    topics: string[]
  ): Promise<void> {
    try {
      for (const topic of topics) {
        await messaging().subscribeToTopic(tokens, topic);
        logger.info(`Subscribed ${tokens.length} tokens to topic: ${topic}`);
      }
    } catch (error) {
      logger.error('Error subscribing to topics:', error);
      throw new HttpsError('internal', 'Failed to subscribe to topics');
    }
  }

  /**
   * Unsubscribe users from topics
   */
  async unsubscribeFromTopics(
    tokens: string[],
    topics: string[]
  ): Promise<void> {
    try {
      for (const topic of topics) {
        await messaging().unsubscribeFromTopic(tokens, topic);
        logger.info(`Unsubscribed ${tokens.length} tokens from topic: ${topic}`);
      }
    } catch (error) {
      logger.error('Error unsubscribing from topics:', error);
      throw new HttpsError('internal', 'Failed to unsubscribe from topics');
    }
  }

  /**
   * Remove invalid tokens from user profiles
   */
  private async removeInvalidTokens(tokens: string[]): Promise<void> {
    const batch = this.db.batch();
    
    for (const token of tokens) {
      const userQuery = await this.db
        .collection('users')
        .where('fcmTokens', 'array-contains', token)
        .get();
      
      userQuery.docs.forEach(doc => {
        const userData = doc.data();
        const updatedTokens = userData.fcmTokens.filter((t: string) => t !== token);
        batch.update(doc.ref, { fcmTokens: updatedTokens });
      });
    }
    
    await batch.commit();
    logger.info(`Removed ${tokens.length} invalid tokens from user profiles`);
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId: string): Promise<TopicSubscription | null> {
    try {
      const doc = await this.db.collection('userNotificationPreferences').doc(userId).get();
      return doc.exists ? doc.data() as TopicSubscription : null;
    } catch (error) {
      logger.error('Error getting user preferences:', error);
      return null;
    }
  }
}

const messagingService = new CloudMessagingService();

// Cloud Function to send notifications
export const sendNotification = onCall(
  { region: 'us-central1', memory: '256MiB' },
  async (request) => {
    const { tokens, topic, condition, notification, data } = request.data;

    if (!notification || !notification.title || !notification.body) {
      throw new HttpsError('invalid-argument', 'Notification title and body are required');
    }

    try {
      if (tokens && Array.isArray(tokens)) {
        return await messagingService.sendToTokens(tokens, notification, data);
      } else if (topic) {
        return await messagingService.sendToTopic(topic, notification, data);
      } else if (condition) {
        return await messagingService.sendConditionalMessage({ condition, notification, data });
      } else {
        throw new HttpsError('invalid-argument', 'Must provide tokens, topic, or condition');
      }
    } catch (error) {
      logger.error('Error in sendNotification function:', error);
      throw error;
    }
  }
);

// Cloud Function to manage topic subscriptions
export const manageTopicSubscriptions = onCall(
  { region: 'us-central1', memory: '256MiB' },
  async (request) => {
    const { action, tokens, topics } = request.data;

    if (!action || !tokens || !topics) {
      throw new HttpsError('invalid-argument', 'Action, tokens, and topics are required');
    }

    try {
      if (action === 'subscribe') {
        await messagingService.subscribeToTopics(tokens, topics);
      } else if (action === 'unsubscribe') {
        await messagingService.unsubscribeFromTopics(tokens, topics);
      } else {
        throw new HttpsError('invalid-argument', 'Action must be subscribe or unsubscribe');
      }

      return { success: true };
    } catch (error) {
      logger.error('Error in manageTopicSubscriptions function:', error);
      throw error;
    }
  }
);

// Trigger notification on order status change
export const onOrderStatusChange = onDocumentUpdated(
  { document: 'orders/{orderId}', region: 'us-central1' },
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    if (!beforeData || !afterData) return;

    const statusChanged = beforeData.status !== afterData.status;
    if (!statusChanged) return;

    const userId = afterData.userId;
    const orderId = event.params.orderId;
    const newStatus = afterData.status;

    // Get user's FCM tokens
    const userDoc = await getFirestore().collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData?.fcmTokens || userData.fcmTokens.length === 0) {
      logger.info(`No FCM tokens found for user ${userId}`);
      return;
    }

    // Check user preferences
    const preferences = await messagingService.getUserPreferences(userId);
    if (preferences && !preferences.preferences.orderUpdates) {
      logger.info(`User ${userId} has disabled order update notifications`);
      return;
    }

    const statusMessages: Record<string, { title: string; body: string }> = {
      confirmed: {
        title: 'Order Confirmed! 🎉',
        body: `Your order #${orderId} has been confirmed and is being prepared.`,
      },
      preparing: {
        title: 'Order in Progress 👨‍🍳',
        body: `Your order #${orderId} is now being prepared by our chefs.`,
      },
      ready: {
        title: 'Order Ready! 🍽️',
        body: `Your order #${orderId} is ready for pickup or delivery.`,
      },
      delivered: {
        title: 'Order Delivered! ✅',
        body: `Your order #${orderId} has been successfully delivered. Enjoy your meal!`,
      },
      cancelled: {
        title: 'Order Cancelled ❌',
        body: `Your order #${orderId} has been cancelled. Contact us if you have questions.`,
      },
    };

    const notification = statusMessages[newStatus];
    if (!notification) return;

    try {
      await messagingService.sendToTokens(
        userData.fcmTokens,
        {
          ...notification,
          clickAction: `/orders/${orderId}`,
        },
        {
          orderId,
          status: newStatus,
          type: 'order_update',
        }
      );

      logger.info(`Sent order status notification to user ${userId} for order ${orderId}`);
    } catch (error) {
      logger.error('Error sending order status notification:', error);
    }
  }
);

// Scheduled function to send promotional notifications
export const sendPromotionalNotifications = onSchedule(
  {
    schedule: 'every friday 10:00',
    timeZone: 'America/New_York',
    region: 'us-central1',
    memory: '512MiB',
  },
  async () => {
    try {
      const notification = {
        title: '🍕 Weekend Special!',
        body: 'Get 20% off on all weekend orders. Use code WEEKEND20',
        imageUrl: 'https://your-domain.com/images/weekend-special.jpg',
        clickAction: '/promotions',
      };

      // Send to users who opted in for promotional notifications
      const condition = "'promotions' in topics && 'general' in topics";
      
      await messagingService.sendConditionalMessage({
        condition,
        notification,
        data: {
          type: 'promotion',
          code: 'WEEKEND20',
          discount: '20',
        },
      });

      logger.info('Successfully sent promotional notifications');
    } catch (error) {
      logger.error('Error sending promotional notifications:', error);
    }
  }
);

export { CloudMessagingService, messagingService };