'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { 
  User, 
  Crown, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  Star, 
  Clock,
  MapPin,
  Phone,
  Mail,
  Shield,
  Gift,
  Zap,
  Target,
  Award,
  Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase-config';
import { format } from 'date-fns';
import Link from 'next/link';

function parseFirestoreTimestamp(ts: any): Date | undefined {
  if (ts?.toDate instanceof Function) {
    return ts.toDate();
  }
  if (typeof ts === 'string' || typeof ts === 'number') {
    return new Date(ts);
  }
  if (ts?._seconds !== undefined) {
    return new Date(ts._seconds * 1000);
  }
  return undefined;
}

interface UserStats {
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: any;
  loginCount: number;
  lastLoginAt: any;
  averageOrderValue: number;
  favoriteRestaurant?: string;
  loyaltyPoints?: number;
  currentTier?: string;
}

interface RecentActivity {
  id: string;
  type: 'order' | 'login' | 'profile_update' | 'reward_earned';
  description: string;
  timestamp: any;
  amount?: number;
  status?: string;
}

interface LoyaltyInfo {
  currentPoints: number;
  currentTier: string;
  nextTier?: string;
  pointsToNextTier?: number;
  tierProgress: number;
  totalEarned: number;
  totalRedeemed: number;
}

export default function CustomerOverview() {
  const { user, loading: authLoading } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loyaltyInfo, setLoyaltyInfo] = useState<LoyaltyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Don't fetch data while auth is still loading
    if (authLoading) {
      return;
    }

    if (user?.uid) {
      fetchCustomerData();
    } else {
      setLoading(false);
      setDataLoading(false);
    }
  }, [user, authLoading]);

  const fetchCustomerData = async () => {
    if (!user?.uid) return;

    try {
      setDataLoading(true);

      // Fetch user profile
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const profile = userDoc.data();
        setUserProfile(profile);
        
        // Extract stats from profile
        const stats: UserStats = {
          totalOrders: profile.stats?.totalOrders || 0,
          totalSpent: profile.stats?.totalSpent || 0,
          lastOrderAt: profile.stats?.lastOrderAt,
          loginCount: profile.stats?.loginCount || 0,
          lastLoginAt: profile.stats?.lastLoginAt,
          averageOrderValue: profile.stats?.totalOrders > 0 
            ? (profile.stats?.totalSpent || 0) / profile.stats.totalOrders 
            : 0,
          loyaltyPoints: profile.loyaltyPoints || 0,
          currentTier: profile.currentTier || 'Bronze'
        };
        setUserStats(stats);
      }

      // Fetch recent orders for activity
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      
      const ordersSnapshot = await getDocs(ordersQuery);
      const activities: RecentActivity[] = [];
      
      ordersSnapshot.forEach((doc) => {
        const order = doc.data();
        activities.push({
          id: doc.id,
          type: 'order',
          description: `Order from ${order.restaurantInfo?.name || 'Restaurant'}`,
          timestamp: order.createdAt,
          amount: order.total,
          status: order.status
        });
      });

      setRecentActivity(activities);

      // Calculate loyalty info
      const points = userProfile?.loyaltyPoints || 0;
      const tier = userProfile?.currentTier || 'Bronze';
      
      const tierThresholds = {
        'Bronze': { min: 0, max: 500 },
        'Silver': { min: 500, max: 1500 },
        'Gold': { min: 1500, max: 3000 },
        'Platinum': { min: 3000, max: Infinity }
      };

      const currentTierInfo = tierThresholds[tier as keyof typeof tierThresholds];
      const nextTierName = tier === 'Bronze' ? 'Silver' : tier === 'Silver' ? 'Gold' : tier === 'Gold' ? 'Platinum' : null;
      const pointsToNext = nextTierName ? tierThresholds[nextTierName as keyof typeof tierThresholds].min - points : 0;
      const progress = currentTierInfo ? Math.min(100, ((points - currentTierInfo.min) / (currentTierInfo.max - currentTierInfo.min)) * 100) : 0;

      setLoyaltyInfo({
        currentPoints: points,
        currentTier: tier,
        nextTier: nextTierName,
        pointsToNextTier: Math.max(0, pointsToNext),
        tierProgress: progress,
        totalEarned: points + (userProfile?.redeemedPoints || 0),
        totalRedeemed: userProfile?.redeemedPoints || 0
      });

    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setDataLoading(false);
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return 'text-orange-600 bg-orange-100';
      case 'silver': return 'text-gray-600 bg-gray-100';
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      case 'platinum': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return ShoppingBag;
      case 'login': return User;
      case 'profile_update': return Shield;
      case 'reward_earned': return Gift;
      default: return Activity;
    }
  };

  // Show loading while auth is loading or data is loading
  if (authLoading || loading || dataLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <User className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Sign In Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to view your customer overview.
          </p>
          <Button asChild>
            <Link href="/signin">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Customer Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.photoURL || userProfile?.photoURL} alt={user.displayName || 'User'} />
              <AvatarFallback className="text-lg">
                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{user.displayName || 'Customer'}</h2>
                {loyaltyInfo && (
                  <Badge className={getTierColor(loyaltyInfo.currentTier)}>
                    <Crown className="h-3 w-3 mr-1" />
                    {loyaltyInfo.currentTier}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
                {userProfile?.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {userProfile.phone}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Member since {userProfile?.createdAt ? (parseFirestoreTimestamp(userProfile.createdAt) ? format(parseFirestoreTimestamp(userProfile.createdAt)!, 'MMM yyyy') : '—') : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              {userStats?.lastOrderAt ? (parseFirestoreTimestamp(userStats.lastOrderAt) ? `Last order ${format(parseFirestoreTimestamp(userStats.lastOrderAt)!, 'MMM d')}` : '—') : 'No orders yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(userStats?.totalSpent || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: ${(userStats?.averageOrderValue || 0).toFixed(2)} per order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loyaltyInfo?.currentPoints || 0}</div>
            <p className="text-xs text-muted-foreground">
              {loyaltyInfo?.totalEarned || 0} earned • {loyaltyInfo?.totalRedeemed || 0} redeemed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.loginCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              {userStats?.lastLoginAt ? (parseFirestoreTimestamp(userStats.lastLoginAt) ? `Last login ${format(parseFirestoreTimestamp(userStats.lastLoginAt)!, 'MMM d')}` : '—') : 'First visit'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Loyalty Progress & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Loyalty Progress */}
        {loyaltyInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Loyalty Progress
              </CardTitle>
              <CardDescription>
                Your journey to the next tier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{loyaltyInfo.currentTier}</span>
                {loyaltyInfo.nextTier && (
                  <span className="text-sm text-muted-foreground">{loyaltyInfo.nextTier}</span>
                )}
              </div>
              <Progress value={loyaltyInfo.tierProgress} className="h-2" />
              {loyaltyInfo.nextTier && loyaltyInfo.pointsToNextTier > 0 && (
                <p className="text-sm text-muted-foreground">
                  {loyaltyInfo.pointsToNextTier} more points to reach {loyaltyInfo.nextTier}
                </p>
              )}
              <div className="flex justify-between text-sm">
                <span>{loyaltyInfo.currentPoints} points</span>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/loyalty">View Rewards</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp ? (parseFirestoreTimestamp(activity.timestamp) ? format(parseFirestoreTimestamp(activity.timestamp)!, 'MMM d, h:mm a') : '—') : 'Recently'}
                          {activity.amount && ` • $${activity.amount.toFixed(2)}`}
                          {activity.status && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {activity.status}
                            </Badge>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                  <Link href="/dashboard/orders">View All Orders</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Manage your account and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/orders" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Order History
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/loyalty" className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Rewards
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}