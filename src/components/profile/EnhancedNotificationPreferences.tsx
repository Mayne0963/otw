'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Volume2, 
  VolumeX, 
  Clock, 
  Shield, 
  Truck, 
  Package, 
  ShoppingCart, 
  Car, 
  CreditCard, 
  Star, 
  Gift, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Save, 
  RotateCcw, 
  Settings,
  Moon,
  Sun,
  Zap,
  Heart,
  TrendingUp,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase-config';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../ui/use-toast';
import { cn } from '../../lib/utils';

interface NotificationPreferences {
  // Delivery notifications
  orderUpdates: boolean;
  deliveryTracking: boolean;
  driverArrival: boolean;
  deliveryConfirmation: boolean;
  
  // Marketing notifications
  promotions: boolean;
  newFeatures: boolean;
  weeklyDigest: boolean;
  personalizedOffers: boolean;
  
  // Account notifications
  securityAlerts: boolean;
  paymentUpdates: boolean;
  profileChanges: boolean;
  loginAlerts: boolean;
  
  // Social notifications
  loyaltyUpdates: boolean;
  referralRewards: boolean;
  reviewReminders: boolean;
  communityUpdates: boolean;
  
  // Notification channels
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  
  // Timing preferences
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
  
  // Frequency settings
  emailFrequency: 'immediate' | 'daily' | 'weekly' | 'never';
  smsFrequency: 'immediate' | 'urgent' | 'never';
  pushFrequency: 'immediate' | 'bundled' | 'never';
}

interface NotificationCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  preferences: (keyof NotificationPreferences)[];
}

const notificationCategories: NotificationCategory[] = [
  {
    id: 'delivery',
    title: 'Delivery & Orders',
    description: 'Stay updated on your orders and deliveries',
    icon: <Truck className="w-5 h-5" />,
    color: 'text-blue-400',
    preferences: ['orderUpdates', 'deliveryTracking', 'driverArrival', 'deliveryConfirmation']
  },
  {
    id: 'marketing',
    title: 'Promotions & Offers',
    description: 'Get notified about deals and new features',
    icon: <Gift className="w-5 h-5" />,
    color: 'text-green-400',
    preferences: ['promotions', 'newFeatures', 'weeklyDigest', 'personalizedOffers']
  },
  {
    id: 'account',
    title: 'Account & Security',
    description: 'Important updates about your account',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-red-400',
    preferences: ['securityAlerts', 'paymentUpdates', 'profileChanges', 'loginAlerts']
  },
  {
    id: 'social',
    title: 'Loyalty & Community',
    description: 'Rewards, referrals, and community updates',
    icon: <Users className="w-5 h-5" />,
    color: 'text-purple-400',
    preferences: ['loyaltyUpdates', 'referralRewards', 'reviewReminders', 'communityUpdates']
  }
];

const preferenceLabels: Record<keyof NotificationPreferences, { label: string; description: string; icon: React.ReactNode }> = {
  // Delivery
  orderUpdates: {
    label: 'Order Updates',
    description: 'Order confirmation, preparation, and status changes',
    icon: <Package className="w-4 h-4" />
  },
  deliveryTracking: {
    label: 'Delivery Tracking',
    description: 'Real-time location updates during delivery',
    icon: <Truck className="w-4 h-4" />
  },
  driverArrival: {
    label: 'Driver Arrival',
    description: 'When your driver is approaching',
    icon: <Bell className="w-4 h-4" />
  },
  deliveryConfirmation: {
    label: 'Delivery Confirmation',
    description: 'When your order has been delivered',
    icon: <CheckCircle className="w-4 h-4" />
  },
  
  // Marketing
  promotions: {
    label: 'Promotions & Discounts',
    description: 'Special offers and discount codes',
    icon: <Gift className="w-4 h-4" />
  },
  newFeatures: {
    label: 'New Features',
    description: 'Updates about new services and features',
    icon: <Zap className="w-4 h-4" />
  },
  weeklyDigest: {
    label: 'Weekly Digest',
    description: 'Summary of your activity and recommendations',
    icon: <TrendingUp className="w-4 h-4" />
  },
  personalizedOffers: {
    label: 'Personalized Offers',
    description: 'Deals based on your preferences and history',
    icon: <Heart className="w-4 h-4" />
  },
  
  // Account
  securityAlerts: {
    label: 'Security Alerts',
    description: 'Suspicious activity and security updates',
    icon: <AlertTriangle className="w-4 h-4" />
  },
  paymentUpdates: {
    label: 'Payment Updates',
    description: 'Payment confirmations and billing changes',
    icon: <CreditCard className="w-4 h-4" />
  },
  profileChanges: {
    label: 'Profile Changes',
    description: 'Confirmations of profile and settings updates',
    icon: <Settings className="w-4 h-4" />
  },
  loginAlerts: {
    label: 'Login Alerts',
    description: 'New device and location login notifications',
    icon: <Smartphone className="w-4 h-4" />
  },
  
  // Social
  loyaltyUpdates: {
    label: 'Loyalty Updates',
    description: 'Points earned, tier changes, and rewards',
    icon: <Star className="w-4 h-4" />
  },
  referralRewards: {
    label: 'Referral Rewards',
    description: 'When friends join and you earn rewards',
    icon: <Users className="w-4 h-4" />
  },
  reviewReminders: {
    label: 'Review Reminders',
    description: 'Reminders to rate your experience',
    icon: <MessageSquare className="w-4 h-4" />
  },
  communityUpdates: {
    label: 'Community Updates',
    description: 'News and updates from the OTW community',
    icon: <Info className="w-4 h-4" />
  },
  
  // Channels (not displayed in categories)
  emailEnabled: { label: 'Email', description: '', icon: <Mail className="w-4 h-4" /> },
  smsEnabled: { label: 'SMS', description: '', icon: <MessageSquare className="w-4 h-4" /> },
  pushEnabled: { label: 'Push', description: '', icon: <Smartphone className="w-4 h-4" /> },
  inAppEnabled: { label: 'In-App', description: '', icon: <Bell className="w-4 h-4" /> },
  
  // Timing
  quietHoursEnabled: { label: 'Quiet Hours', description: '', icon: <Moon className="w-4 h-4" /> },
  quietHoursStart: { label: 'Start Time', description: '', icon: <Clock className="w-4 h-4" /> },
  quietHoursEnd: { label: 'End Time', description: '', icon: <Clock className="w-4 h-4" /> },
  timezone: { label: 'Timezone', description: '', icon: <Clock className="w-4 h-4" /> },
  
  // Frequency
  emailFrequency: { label: 'Email Frequency', description: '', icon: <Mail className="w-4 h-4" /> },
  smsFrequency: { label: 'SMS Frequency', description: '', icon: <MessageSquare className="w-4 h-4" /> },
  pushFrequency: { label: 'Push Frequency', description: '', icon: <Smartphone className="w-4 h-4" /> }
};

const defaultPreferences: NotificationPreferences = {
  // Delivery notifications
  orderUpdates: true,
  deliveryTracking: true,
  driverArrival: true,
  deliveryConfirmation: true,
  
  // Marketing notifications
  promotions: true,
  newFeatures: true,
  weeklyDigest: false,
  personalizedOffers: true,
  
  // Account notifications
  securityAlerts: true,
  paymentUpdates: true,
  profileChanges: true,
  loginAlerts: true,
  
  // Social notifications
  loyaltyUpdates: true,
  referralRewards: true,
  reviewReminders: false,
  communityUpdates: false,
  
  // Notification channels
  emailEnabled: true,
  smsEnabled: true,
  pushEnabled: true,
  inAppEnabled: true,
  
  // Timing preferences
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  timezone: 'America/New_York',
  
  // Frequency settings
  emailFrequency: 'immediate',
  smsFrequency: 'urgent',
  pushFrequency: 'immediate'
};

export default function EnhancedNotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalPreferences, setOriginalPreferences] = useState<NotificationPreferences>(defaultPreferences);

  // Load preferences from Firebase
  const loadPreferences = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const userPreferences = {
          ...defaultPreferences,
          ...userData.notificationPreferences
        };
        setPreferences(userPreferences);
        setOriginalPreferences(userPreferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, [user]);

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(preferences) !== JSON.stringify(originalPreferences);
    setHasChanges(changed);
  }, [preferences, originalPreferences]);

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const savePreferences = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        notificationPreferences: preferences,
        updatedAt: new Date().toISOString()
      });
      
      setOriginalPreferences(preferences);
      setHasChanges(false);
      
      toast({
        title: 'Success',
        description: 'Notification preferences saved successfully'
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const resetPreferences = () => {
    setPreferences(originalPreferences);
    setHasChanges(false);
  };

  const enableAll = (categoryId: string) => {
    const category = notificationCategories.find(cat => cat.id === categoryId);
    if (!category) return;
    
    const updates: Partial<NotificationPreferences> = {};
    category.preferences.forEach(pref => {
      updates[pref] = true;
    });
    
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const disableAll = (categoryId: string) => {
    const category = notificationCategories.find(cat => cat.id === categoryId);
    if (!category) return;
    
    const updates: Partial<NotificationPreferences> = {};
    category.preferences.forEach(pref => {
      updates[pref] = false;
    });
    
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-otw-gold"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bell className="w-6 h-6 text-otw-gold" />
            Notification Preferences
          </h1>
          <p className="text-gray-400 mt-1">
            Customize how and when you receive notifications
          </p>
        </div>
        
        {hasChanges && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={resetPreferences}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={savePreferences}
              disabled={saving}
              className="bg-otw-gold text-black hover:bg-otw-gold/90"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Notification Channels */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-otw-gold" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: 'emailEnabled' as const, icon: <Mail className="w-5 h-5" />, label: 'Email', color: 'text-blue-400' },
              { key: 'smsEnabled' as const, icon: <MessageSquare className="w-5 h-5" />, label: 'SMS', color: 'text-green-400' },
              { key: 'pushEnabled' as const, icon: <Smartphone className="w-5 h-5" />, label: 'Push', color: 'text-purple-400' },
              { key: 'inAppEnabled' as const, icon: <Bell className="w-5 h-5" />, label: 'In-App', color: 'text-orange-400' }
            ].map(channel => (
              <div key={channel.key} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg bg-gray-700", channel.color)}>
                    {channel.icon}
                  </div>
                  <span className="text-white font-medium">{channel.label}</span>
                </div>
                <Switch
                  checked={preferences[channel.key]}
                  onCheckedChange={(checked) => updatePreference(channel.key, checked)}
                />
              </div>
            ))}
          </div>
          
          {/* Frequency Settings */}
          <Separator className="bg-gray-600" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-white text-sm font-medium mb-2 block">Email Frequency</Label>
              <Select 
                value={preferences.emailFrequency} 
                onValueChange={(value: any) => updatePreference('emailFrequency', value)}
                disabled={!preferences.emailEnabled}
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Digest</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-white text-sm font-medium mb-2 block">SMS Frequency</Label>
              <Select 
                value={preferences.smsFrequency} 
                onValueChange={(value: any) => updatePreference('smsFrequency', value)}
                disabled={!preferences.smsEnabled}
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="urgent">Urgent Only</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-white text-sm font-medium mb-2 block">Push Frequency</Label>
              <Select 
                value={preferences.pushFrequency} 
                onValueChange={(value: any) => updatePreference('pushFrequency', value)}
                disabled={!preferences.pushEnabled}
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="bundled">Bundled</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Moon className="w-5 h-5 text-otw-gold" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Set times when you don't want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch
                checked={preferences.quietHoursEnabled}
                onCheckedChange={(checked) => updatePreference('quietHoursEnabled', checked)}
              />
              <Label className="text-white font-medium">Enable Quiet Hours</Label>
            </div>
          </div>
          
          {preferences.quietHoursEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">Start Time</Label>
                <Select 
                  value={preferences.quietHoursStart} 
                  onValueChange={(value) => updatePreference('quietHoursStart', value)}
                >
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">End Time</Label>
                <Select 
                  value={preferences.quietHoursEnd} 
                  onValueChange={(value) => updatePreference('quietHoursEnd', value)}
                >
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">Timezone</Label>
                <Select 
                  value={preferences.timezone} 
                  onValueChange={(value) => updatePreference('timezone', value)}
                >
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Notification Categories */}
      <div className="space-y-4">
        {notificationCategories.map((category) => (
          <Card key={category.id} className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg bg-gray-700", category.color)}>
                    {category.icon}
                  </div>
                  <div>
                    <CardTitle className="text-white">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => enableAll(category.id)}
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    Enable All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disableAll(category.id)}
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    Disable All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {category.preferences.map((prefKey) => {
                  const pref = preferenceLabels[prefKey];
                  return (
                    <div key={prefKey} className="flex items-center justify-between p-3 bg-gray-700/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-400">
                          {pref.icon}
                        </div>
                        <div>
                          <div className="text-white font-medium">{pref.label}</div>
                          <div className="text-gray-400 text-sm">{pref.description}</div>
                        </div>
                      </div>
                      <Switch
                        checked={preferences[prefKey] as boolean}
                        onCheckedChange={(checked) => updatePreference(prefKey, checked)}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save Button (Sticky) */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-white text-sm">
                    You have unsaved changes
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetPreferences}
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      onClick={savePreferences}
                      disabled={saving}
                      className="bg-otw-gold text-black hover:bg-otw-gold/90"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}