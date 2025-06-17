'use client';

import { useState, useCallback, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Suspense } from 'react';
import CustomerOverview from '@/components/dashboard/CustomerOverview';
import OrderHistory from '@/components/dashboard/OrderHistory';
import Favorites from '@/components/dashboard/Favorites';
import Tasks from '@/components/dashboard/Tasks';
import TierPerks from '@/components/dashboard/TierPerks';
import TabLoadingSpinner from '@/components/dashboard/TabLoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, User } from 'lucide-react';

type TabValue = 'overview' | 'orders' | 'favorites' | 'tasks' | 'tier-perks';

interface TabConfig {
  id: TabValue;
  label: string;
  component: React.ComponentType;
  requiresAuth?: boolean;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('overview');
  const { user, loading } = useAuth();

  const tabs: TabConfig[] = useMemo(() => [
    { id: 'overview', label: 'Overview', component: CustomerOverview, requiresAuth: false },
    { id: 'orders', label: 'Order History', component: OrderHistory, requiresAuth: true },
    { id: 'favorites', label: 'Favorites', component: Favorites, requiresAuth: false },
    { id: 'tasks', label: 'Tasks', component: Tasks, requiresAuth: false },
    { id: 'tier-perks', label: 'Tier Perks', component: TierPerks, requiresAuth: true },
  ], []);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as TabValue);
  }, []);

  const renderTabContent = useCallback((tab: TabConfig) => {
    const Component = tab.component;
    
    // Show loading while authentication is loading
    if (loading) {
      return <TabLoadingSpinner />;
    }
    
    // Show auth required message for protected tabs
    if (tab.requiresAuth && !user) {
      return (
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <User className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Sign In Required
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              Please sign in to access your {tab.label.toLowerCase()}.
            </p>
            <Button 
              className="flex items-center gap-2"
              onClick={() => window.location.href = '/signin'}
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Suspense fallback={<TabLoadingSpinner />}>
        <Component />
      </Suspense>
    );
  }, [user, loading]);

  // Show loading spinner while authentication is loading
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <TabLoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {user 
            ? `Welcome back, ${user.displayName || user.email || 'User'}! Manage your orders, favorites, and account settings.`
            : 'Manage your favorites and tasks, or sign in for full access.'
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="relative transition-all duration-200"
              disabled={tab.requiresAuth && !user}
            >
              {tab.label}
              {tab.requiresAuth && !user && (
                <span className="ml-1 text-xs opacity-60">🔒</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent 
            key={tab.id} 
            value={tab.id} 
            className="mt-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {activeTab === tab.id && renderTabContent(tab)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
