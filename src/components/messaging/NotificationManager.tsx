import React, { useState } from 'react';
import { useCloudMessaging, NotificationPayload } from '../../hooks/useCloudMessaging';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface NotificationManagerProps {
  className?: string;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const {
    token,
    isSupported,
    permission,
    isLoading,
    error,
    subscriptions,
    requestPermission,
    getMessagingToken,
    deleteMessagingToken,
    subscribeToTopic,
    unsubscribeFromTopic,
    sendNotificationToTopic,
    sendConditionalNotification,
    isEnabled,
    hasPermission,
    needsPermission,
    permissionDenied,
  } = useCloudMessaging();

  const [activeTab, setActiveTab] = useState<'settings' | 'topics' | 'send'>('settings');
  const [newTopic, setNewTopic] = useState('');
  const [notificationForm, setNotificationForm] = useState({
    type: 'topic' as 'topic' | 'conditional',
    target: '',
    title: '',
    body: '',
    icon: '',
    image: '',
    url: '',
  });

  const availableTopics = [
    { id: 'general', name: 'General Updates', description: 'General app updates and announcements' },
    { id: 'orders', name: 'Order Updates', description: 'Updates about your orders' },
    { id: 'promotions', name: 'Promotions', description: 'Special offers and promotions' },
    { id: 'news', name: 'News', description: 'Latest news and updates' },
    { id: 'maintenance', name: 'Maintenance', description: 'System maintenance notifications' },
  ];

  const handleEnableNotifications = async () => {
    if (needsPermission) {
      await requestPermission();
    }
    if (hasPermission && !token) {
      await getMessagingToken();
    }
  };

  const handleDisableNotifications = async () => {
    await deleteMessagingToken();
  };

  const handleTopicSubscription = async (topicId: string, subscribe: boolean) => {
    if (subscribe) {
      await subscribeToTopic(topicId);
    } else {
      await unsubscribeFromTopic(topicId);
    }
  };

  const handleAddCustomTopic = async () => {
    if (!newTopic.trim()) {
      toast.error('Please enter a topic name');
      return;
    }
    
    await subscribeToTopic(newTopic.trim());
    setNewTopic('');
  };

  const handleSendNotification = async () => {
    if (!notificationForm.title || !notificationForm.body || !notificationForm.target) {
      toast.error('Please fill in all required fields');
      return;
    }

    const payload: NotificationPayload = {
      title: notificationForm.title,
      body: notificationForm.body,
      icon: notificationForm.icon || undefined,
      image: notificationForm.image || undefined,
      data: notificationForm.url ? { url: notificationForm.url } : undefined,
    };

    let success = false;
    if (notificationForm.type === 'topic') {
      success = await sendNotificationToTopic(notificationForm.target, payload);
    } else {
      success = await sendConditionalNotification(notificationForm.target, payload);
    }

    if (success) {
      setNotificationForm({
        type: 'topic',
        target: '',
        title: '',
        body: '',
        icon: '',
        image: '',
        url: '',
      });
    }
  };

  const isTopicSubscribed = (topicId: string) => {
    return subscriptions.some(sub => sub.topic === topicId && sub.subscribed);
  };

  const getPermissionStatusColor = () => {
    if (permissionDenied) return 'text-red-600';
    if (hasPermission) return 'text-green-600';
    return 'text-yellow-600';
  };

  const getPermissionStatusText = () => {
    if (permissionDenied) return 'Denied';
    if (hasPermission) return 'Granted';
    return 'Not requested';
  };

  if (!isSupported) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <svg className="h-5 w-5 text-yellow-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-yellow-800">
            Push notifications are not supported in this browser.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
        <p className="text-sm text-gray-600 mt-1">
          Manage your push notification preferences and subscriptions
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'settings', label: 'Settings' },
            { id: 'topics', label: 'Topics' },
            { id: 'send', label: 'Send Notification' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Permission Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Permission Status</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Notification Permission: <span className={getPermissionStatusColor()}>{getPermissionStatusText()}</span>
                  </p>
                  {token && (
                    <p className="text-xs text-gray-500 mt-1">
                      Device Token: {token.substring(0, 20)}...
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {isEnabled ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Disabled
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Enable/Disable Notifications */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Notification Control</h3>
              
              {!isEnabled ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Enable push notifications to receive real-time updates about your orders, promotions, and important announcements.
                  </p>
                  <button
                    onClick={handleEnableNotifications}
                    disabled={isLoading || !user}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12" />
                      </svg>
                    )}
                    Enable Notifications
                  </button>
                  {!user && (
                    <p className="text-sm text-red-600">
                      Please sign in to enable notifications.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Notifications are currently enabled. You'll receive updates based on your topic subscriptions.
                  </p>
                  <button
                    onClick={handleDisableNotifications}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                    Disable Notifications
                  </button>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Topics Tab */}
        {activeTab === 'topics' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Available Topics</h3>
              <div className="space-y-3">
                {availableTopics.map((topic) => (
                  <div key={topic.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{topic.name}</h4>
                      <p className="text-xs text-gray-500">{topic.description}</p>
                    </div>
                    <button
                      onClick={() => handleTopicSubscription(topic.id, !isTopicSubscribed(topic.id))}
                      disabled={!isEnabled}
                      className={`ml-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        isTopicSubscribed(topic.id)
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isTopicSubscribed(topic.id) ? 'Subscribed' : 'Subscribe'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Topic Subscription */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Subscribe to Custom Topic</h3>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Enter topic name"
                  className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={!isEnabled}
                />
                <button
                  onClick={handleAddCustomTopic}
                  disabled={!isEnabled || !newTopic.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Subscribe
                </button>
              </div>
            </div>

            {/* Current Subscriptions */}
            {subscriptions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Your Subscriptions</h3>
                <div className="space-y-2">
                  {subscriptions.filter(sub => sub.subscribed).map((subscription) => (
                    <div key={subscription.topic} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-900">{subscription.topic}</span>
                      <button
                        onClick={() => handleTopicSubscription(subscription.topic, false)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Unsubscribe
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Send Notification Tab */}
        {activeTab === 'send' && (
          <div className="space-y-6">
            {user ? (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Send Test Notification</h3>
                
                {/* Notification Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={notificationForm.type}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="topic">Topic</option>
                    <option value="conditional">Conditional</option>
                  </select>
                </div>

                {/* Target */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {notificationForm.type === 'topic' ? 'Topic' : 'Condition'}
                  </label>
                  <input
                    type="text"
                    value={notificationForm.target}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, target: e.target.value }))}
                    placeholder={notificationForm.type === 'topic' ? 'e.g., general' : "e.g., 'general' in topics"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Notification title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea
                    value={notificationForm.body}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Notification message"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                {/* Optional fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Icon URL</label>
                    <input
                      type="url"
                      value={notificationForm.icon}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, icon: e.target.value }))}
                      placeholder="https://example.com/icon.png"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                    <input
                      type="url"
                      value={notificationForm.image}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://example.com/image.png"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Click URL</label>
                  <input
                    type="url"
                    value={notificationForm.url}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com/page"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                <button
                  onClick={handleSendNotification}
                  disabled={!notificationForm.title || !notificationForm.body || !notificationForm.target}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Notification
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Please sign in to send notifications.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationManager;