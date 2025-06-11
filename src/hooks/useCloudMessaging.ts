import { useState, useEffect, useCallback } from 'react';
import { getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

interface SendNotificationOptions {
  token?: string;
  topic?: string;
  condition?: string;
  payload: NotificationPayload;
  android?: {
    priority?: 'normal' | 'high';
    ttl?: number;
    collapseKey?: string;
  };
  apns?: {
    priority?: number;
    expiration?: number;
  };
  webpush?: {
    ttl?: number;
    urgency?: 'very-low' | 'low' | 'normal' | 'high';
    topic?: string;
  };
}

interface MessagingState {
  token: string | null;
  isSupported: boolean;
  permission: NotificationPermission;
  isLoading: boolean;
  error: string | null;
  lastMessage: any | null;
}

interface TopicSubscription {
  topic: string;
  subscribed: boolean;
}

export const useCloudMessaging = () => {
  const { user } = useAuth();
  const [messagingState, setMessagingState] = useState<MessagingState>({
    token: null,
    isSupported: false,
    permission: 'default',
    isLoading: false,
    error: null,
    lastMessage: null,
  });
  
  const [subscriptions, setSubscriptions] = useState<TopicSubscription[]>([]);
  const [messaging, setMessaging] = useState<any>(null);
  const functions = getFunctions();

  // Check if messaging is supported
  const checkMessagingSupport = useCallback(() => {
    try {
      const isSupported = 'serviceWorker' in navigator && 'Notification' in window;
      setMessagingState(prev => ({ ...prev, isSupported }));
      return isSupported;
    } catch (error) {
      console.warn('Messaging not supported:', error);
      setMessagingState(prev => ({ ...prev, isSupported: false }));
      return false;
    }
  }, []);

  // Initialize messaging
  const initializeMessaging = useCallback(async () => {
    if (!checkMessagingSupport()) {
      return;
    }

    try {
      const messagingInstance = getMessaging();
      setMessaging(messagingInstance);
      
      // Check current permission
      const permission = Notification.permission;
      setMessagingState(prev => ({ ...prev, permission }));
      
      return messagingInstance;
    } catch (error: any) {
      console.error('Failed to initialize messaging:', error);
      setMessagingState(prev => ({
        ...prev,
        error: 'Failed to initialize messaging',
      }));
    }
  }, [checkMessagingSupport]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!messaging) {
      await initializeMessaging();
    }

    try {
      const permission = await Notification.requestPermission();
      setMessagingState(prev => ({ ...prev, permission }));
      
      if (permission === 'granted') {
        toast.success('Notifications enabled successfully');
        return true;
      } else if (permission === 'denied') {
        toast.error('Notification permission denied');
        return false;
      } else {
        toast.info('Notification permission dismissed');
        return false;
      }
    } catch (error: any) {
      console.error('Error requesting permission:', error);
      toast.error('Failed to request notification permission');
      return false;
    }
  }, [messaging, initializeMessaging]);

  // Get FCM token
  const getMessagingToken = useCallback(async (): Promise<string | null> => {
    if (!messaging) {
      await initializeMessaging();
    }

    if (messagingState.permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        return null;
      }
    }

    setMessagingState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;
      const token = await getToken(messaging, {
        vapidKey: vapidKey,
      });
      
      setMessagingState(prev => ({
        ...prev,
        token,
        isLoading: false,
      }));
      
      // Save token to user profile if user is authenticated
      if (user && token) {
        await saveTokenToProfile(token);
      }
      
      return token;
    } catch (error: any) {
      console.error('Error getting token:', error);
      const errorMessage = 'Failed to get messaging token';
      setMessagingState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      toast.error(errorMessage);
      return null;
    }
  }, [messaging, messagingState.permission, user, initializeMessaging, requestPermission]);

  // Save token to user profile
  const saveTokenToProfile = useCallback(async (token: string) => {
    if (!user) return;

    try {
      const saveToken = httpsCallable(functions, 'saveMessagingToken');
      await saveToken({ token });
    } catch (error) {
      console.warn('Failed to save token to profile:', error);
    }
  }, [user, functions]);

  // Delete messaging token
  const deleteMessagingToken = useCallback(async (): Promise<boolean> => {
    if (!messaging || !messagingState.token) {
      return false;
    }

    try {
      await deleteToken(messaging);
      setMessagingState(prev => ({ ...prev, token: null }));
      
      // Remove token from user profile
      if (user) {
        const removeToken = httpsCallable(functions, 'removeMessagingToken');
        await removeToken({ token: messagingState.token });
      }
      
      toast.success('Notifications disabled');
      return true;
    } catch (error: any) {
      console.error('Error deleting token:', error);
      toast.error('Failed to disable notifications');
      return false;
    }
  }, [messaging, messagingState.token, user, functions]);

  // Subscribe to topic
  const subscribeToTopic = useCallback(async (topic: string): Promise<boolean> => {
    if (!messagingState.token) {
      toast.error('Please enable notifications first');
      return false;
    }

    try {
      const subscribeToTopic = httpsCallable(functions, 'subscribeToTopic');
      await subscribeToTopic({
        token: messagingState.token,
        topic,
      });
      
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.topic === topic 
            ? { ...sub, subscribed: true }
            : sub
        )
      );
      
      toast.success(`Subscribed to ${topic}`);
      return true;
    } catch (error: any) {
      console.error('Error subscribing to topic:', error);
      toast.error(`Failed to subscribe to ${topic}`);
      return false;
    }
  }, [messagingState.token, functions]);

  // Unsubscribe from topic
  const unsubscribeFromTopic = useCallback(async (topic: string): Promise<boolean> => {
    if (!messagingState.token) {
      return false;
    }

    try {
      const unsubscribeFromTopic = httpsCallable(functions, 'unsubscribeFromTopic');
      await unsubscribeFromTopic({
        token: messagingState.token,
        topic,
      });
      
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.topic === topic 
            ? { ...sub, subscribed: false }
            : sub
        )
      );
      
      toast.success(`Unsubscribed from ${topic}`);
      return true;
    } catch (error: any) {
      console.error('Error unsubscribing from topic:', error);
      toast.error(`Failed to unsubscribe from ${topic}`);
      return false;
    }
  }, [messagingState.token, functions]);

  // Send notification to specific token
  const sendNotificationToToken = useCallback(async (
    targetToken: string,
    payload: NotificationPayload,
    options?: Partial<SendNotificationOptions>
  ): Promise<boolean> => {
    if (!user) {
      toast.error('Please sign in to send notifications');
      return false;
    }

    try {
      const sendNotification = httpsCallable(functions, 'sendNotificationToToken');
      await sendNotification({
        token: targetToken,
        payload,
        ...options,
      });
      
      toast.success('Notification sent successfully');
      return true;
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
      return false;
    }
  }, [user, functions]);

  // Send notification to topic
  const sendNotificationToTopic = useCallback(async (
    topic: string,
    payload: NotificationPayload,
    options?: Partial<SendNotificationOptions>
  ): Promise<boolean> => {
    if (!user) {
      toast.error('Please sign in to send notifications');
      return false;
    }

    try {
      const sendNotification = httpsCallable(functions, 'sendNotificationToTopic');
      await sendNotification({
        topic,
        payload,
        ...options,
      });
      
      toast.success(`Notification sent to ${topic}`);
      return true;
    } catch (error: any) {
      console.error('Error sending notification to topic:', error);
      toast.error(`Failed to send notification to ${topic}`);
      return false;
    }
  }, [user, functions]);

  // Send conditional notification
  const sendConditionalNotification = useCallback(async (
    condition: string,
    payload: NotificationPayload,
    options?: Partial<SendNotificationOptions>
  ): Promise<boolean> => {
    if (!user) {
      toast.error('Please sign in to send notifications');
      return false;
    }

    try {
      const sendNotification = httpsCallable(functions, 'sendConditionalNotification');
      await sendNotification({
        condition,
        payload,
        ...options,
      });
      
      toast.success('Conditional notification sent');
      return true;
    } catch (error: any) {
      console.error('Error sending conditional notification:', error);
      toast.error('Failed to send conditional notification');
      return false;
    }
  }, [user, functions]);

  // Get user's topic subscriptions
  const getUserSubscriptions = useCallback(async () => {
    if (!user || !messagingState.token) {
      return;
    }

    try {
      const getSubscriptions = httpsCallable(functions, 'getUserTopicSubscriptions');
      const { data } = await getSubscriptions({ token: messagingState.token });
      setSubscriptions(data as TopicSubscription[]);
    } catch (error) {
      console.warn('Failed to get user subscriptions:', error);
    }
  }, [user, messagingState.token, functions]);

  // Handle foreground messages
  const setupForegroundMessageHandler = useCallback(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      
      setMessagingState(prev => ({ ...prev, lastMessage: payload }));
      
      // Show notification if permission is granted
      if (Notification.permission === 'granted' && payload.notification) {
        const notification = new Notification(
          payload.notification.title || 'New Message',
          {
            body: payload.notification.body,
            icon: payload.notification.icon || '/icon-192x192.png',
            image: payload.notification.image,
            badge: payload.notification.badge,
            tag: payload.data?.tag,
            data: payload.data,
          }
        );
        
        // Handle notification click
        notification.onclick = () => {
          window.focus();
          notification.close();
          
          // Handle custom click action
          if (payload.data?.url) {
            window.open(payload.data.url, '_blank');
          }
        };
        
        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
    });

    return unsubscribe;
  }, [messaging]);

  // Initialize on mount
  useEffect(() => {
    initializeMessaging();
  }, [initializeMessaging]);

  // Setup message handler when messaging is available
  useEffect(() => {
    if (messaging) {
      const unsubscribe = setupForegroundMessageHandler();
      return unsubscribe;
    }
  }, [messaging, setupForegroundMessageHandler]);

  // Get token when user signs in
  useEffect(() => {
    if (user && messaging && messagingState.permission === 'granted' && !messagingState.token) {
      getMessagingToken();
    }
  }, [user, messaging, messagingState.permission, messagingState.token, getMessagingToken]);

  // Load subscriptions when token is available
  useEffect(() => {
    if (messagingState.token) {
      getUserSubscriptions();
    }
  }, [messagingState.token, getUserSubscriptions]);

  return {
    // State
    token: messagingState.token,
    isSupported: messagingState.isSupported,
    permission: messagingState.permission,
    isLoading: messagingState.isLoading,
    error: messagingState.error,
    lastMessage: messagingState.lastMessage,
    subscriptions,
    
    // Actions
    requestPermission,
    getMessagingToken,
    deleteMessagingToken,
    subscribeToTopic,
    unsubscribeFromTopic,
    sendNotificationToToken,
    sendNotificationToTopic,
    sendConditionalNotification,
    getUserSubscriptions,
    
    // Computed values
    isEnabled: !!messagingState.token,
    canSendNotifications: !!user,
    hasPermission: messagingState.permission === 'granted',
    needsPermission: messagingState.permission === 'default',
    permissionDenied: messagingState.permission === 'denied',
  };
};

export default useCloudMessaging;
export type { NotificationPayload, SendNotificationOptions, TopicSubscription };