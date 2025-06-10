'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Clock, MapPin, DollarSign, Star, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../lib/firebase-config';
import { cn } from '../../lib/utils';

interface Order {
  id: string;
  type: 'regular' | 'screenshot';
  userRef?: string;
  total?: number;
  status: string;
  createdAt: any;
  cart?: any[];
  stripeId?: string;
  orderId?: string;
  customerInfo?: {
    name: string;
    phone: string;
    email: string;
  };
  restaurantInfo?: {
    name: string;
    pickupLocation: string;
  };
  orderDetails?: {
    estimatedTotal: string;
    specialInstructions: string;
  };
  timestamps?: {
    created: string;
    updated?: string;
  };
  items?: any[];
  orderType?: string;
  contactInfo?: any;
  deliveryInfo?: any;
}

interface OrderSummary {
  totalOrders: number;
  totalSpent: number;
  completedOrders: number;
  averageOrderValue: number;
}

interface OrdersResponse {
  orders: Order[];
  summary: OrderSummary;
  hasMore: boolean;
}

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<OrderSummary>({
    totalOrders: 0,
    totalSpent: 0,
    completedOrders: 0,
    averageOrderValue: 0,
  });
  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
    hasMore: false,
  });

  // Fetch orders with improved error handling and timeout
  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (!user?.uid) {
      setLoading(false);
      setError(null);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Check if user is authenticated
      if (!auth.currentUser) {
        throw new Error('Please sign in to view your order history.');
      }

      // Get Firebase ID token with retry logic and timeout
      let idToken: string;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          const tokenPromise = auth.currentUser?.getIdToken(true);
          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Token request timeout')), 10000)
          );
          
          idToken = await Promise.race([tokenPromise, timeoutPromise]) || '';
          if (idToken) break;
        } catch (tokenError) {
          retryCount++;
          if (retryCount >= maxRetries) {
            throw new Error('Authentication failed. Please sign in again.');
          }
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`/api/orders/user?limit=${pagination.limit}&offset=${pagination.offset}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please sign in again.');
        }
        if (response.status === 404) {
          // No orders found - this is not an error
          setOrders([]);
          setSummary({
            totalOrders: 0,
            totalSpent: 0,
            completedOrders: 0,
            averageOrderValue: 0,
          });
          return;
        }
        
        if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: OrdersResponse = await response.json();
      
      // Validate response data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
      }
      
      if (isRefresh || pagination.offset === 0) {
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } else {
        setOrders(prev => [...prev, ...(Array.isArray(data.orders) ? data.orders : [])]);
      }
      
      setSummary(data.summary || {
        totalOrders: 0,
        totalSpent: 0,
        completedOrders: 0,
        averageOrderValue: 0,
      });
      
      setPagination(prev => ({
        ...prev,
        hasMore: data.hasMore || false,
      }));
      
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timeout. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load order history. Please try again.');
      }
      
      // Set empty state on error
      setOrders([]);
      setSummary({
        totalOrders: 0,
        totalSpent: 0,
        completedOrders: 0,
        averageOrderValue: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid, pagination.limit, pagination.offset]);

  // Initial load effect with proper dependency management
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialData = async () => {
      if (user?.uid && isMounted) {
        try {
          await fetchOrders();
        } catch (error) {
          console.error('Failed to load initial data:', error);
          if (isMounted) {
            setError('Failed to load order history. Please try again.');
            setLoading(false);
          }
        }
      } else if (!user?.uid && isMounted) {
        setLoading(false);
        setError(null);
        setOrders([]);
      }
    };
    
    loadInitialData();
    
    return () => {
      isMounted = false;
    };
  }, [user?.uid]); // Remove fetchOrders from dependencies to prevent infinite loop

  // Refresh function
  const handleRefresh = useCallback(async () => {
    await fetchOrders(true);
  }, [fetchOrders]);

  // Retry function for error states
  const handleRetry = useCallback(async () => {
    setError(null);
    await fetchOrders();
  }, [fetchOrders]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    
    let dateObj: Date;
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date.toDate && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else {
      return 'N/A';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'text-green-400 bg-green-400/10';
      case 'pending':
      case 'processing':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'cancelled':
      case 'failed':
        return 'text-red-400 bg-red-400/10';
      case 'in_progress':
      case 'assigned':
        return 'text-blue-400 bg-blue-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-otw-gold" />
        <p className="text-gray-400">Loading your order history...</p>
      </div>
    );
  }

  // Error state
  if (error && !loading && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <Clock className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Unable to Load Orders</h3>
          <p className="text-gray-400 mb-6 max-w-md">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleRetry} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && !error && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-otw-gold/10 flex items-center justify-center">
            <Clock className="w-8 h-8 text-otw-gold" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Orders Yet</h3>
          <p className="text-gray-400 mb-6 max-w-md">
            You haven't placed any orders yet. Start by booking a service!
          </p>
          <Button variant="default" size="sm">
            Browse Services
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-otw-black-800/50 border-otw-black-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-otw-gold/20">
              <Clock className="w-5 h-5 text-otw-gold" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Orders</p>
              <p className="text-xl font-bold text-white">{summary.totalOrders}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-otw-black-800/50 border-otw-black-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-500/20">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Spent</p>
              <p className="text-xl font-bold text-white">{formatCurrency(summary.totalSpent)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-otw-black-800/50 border-otw-black-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-500/20">
              <Star className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Completed</p>
              <p className="text-xl font-bold text-white">{summary.completedOrders}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-otw-black-800/50 border-otw-black-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-purple-500/20">
              <MapPin className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Avg Order</p>
              <p className="text-xl font-bold text-white">{formatCurrency(summary.averageOrderValue)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-otw-gold">Order History</h2>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm" 
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-6 bg-otw-black-800/50 border-otw-black-700 hover:border-otw-gold/30 transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-white">
                    Order #{order.orderId || order.id.slice(-8).toUpperCase()}
                  </h3>
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    getStatusColor(order.status)
                  )}>
                    {order.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-otw-gold/20 text-otw-gold">
                    {order.type === 'screenshot' ? 'SCREENSHOT' : 'REGULAR'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Date</p>
                    <p className="text-white">{formatDate(order.createdAt)}</p>
                  </div>
                  
                  {order.type === 'regular' && order.total && (
                    <div>
                      <p className="text-gray-400">Total</p>
                      <p className="text-white font-semibold">{formatCurrency(order.total)}</p>
                    </div>
                  )}
                  
                  {order.type === 'screenshot' && order.orderDetails?.estimatedTotal && (
                    <div>
                      <p className="text-gray-400">Estimated Total</p>
                      <p className="text-white font-semibold">{order.orderDetails.estimatedTotal}</p>
                    </div>
                  )}
                  
                  {order.restaurantInfo?.name && (
                    <div>
                      <p className="text-gray-400">Restaurant</p>
                      <p className="text-white">{order.restaurantInfo.name}</p>
                    </div>
                  )}
                  
                  {order.restaurantInfo?.pickupLocation && (
                    <div>
                      <p className="text-gray-400">Pickup Location</p>
                      <p className="text-white text-xs">{order.restaurantInfo.pickupLocation}</p>
                    </div>
                  )}
                </div>
                
                {order.orderDetails?.specialInstructions && (
                  <div className="mt-3">
                    <p className="text-gray-400 text-sm">Special Instructions</p>
                    <p className="text-white text-sm">{order.orderDetails.specialInstructions}</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                {(order.status === 'completed' || order.status === 'delivered') && (
                  <Button variant="outline" size="sm">
                    Reorder
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Load More */}
      {pagination.hasMore && (
        <div className="flex justify-center pt-6">
          <Button 
            variant="outline" 
            onClick={() => {
              setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }));
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Orders'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
