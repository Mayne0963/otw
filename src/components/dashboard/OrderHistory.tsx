'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Clock, MapPin, DollarSign, Star, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../lib/firebase-config';

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
  success: boolean;
  orders: Order[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  summary: OrderSummary;
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<OrderSummary>({
    totalOrders: 0,
    totalSpent: 0,
    completedOrders: 0,
    averageOrderValue: 0
  });
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0,
    hasMore: false
  });
  const { user } = useAuth();

  // Fetch orders from API
  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Get Firebase ID token for authentication
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`/api/orders/user?limit=${pagination.limit}&offset=${pagination.offset}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please sign in again.');
        }
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data: OrdersResponse = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
        setSummary(data.summary);
        setPagination(data.pagination);
      } else {
        throw new Error('Failed to load order history');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load order history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, pagination.limit, pagination.offset]);

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, [user]);

  // Refresh function
  const handleRefresh = () => {
    fetchOrders(true);
  };

  // Load more function for pagination
  const loadMore = () => {
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit
    }));
  };

  // Use summary data from API
  const { totalOrders, totalSpent, completedOrders, averageOrderValue } = summary;

  // Format date helper
  const formatDate = (date: any) => {
    if (!date) return 'Unknown';

    let dateObj: Date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date.toDate && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return 'Unknown';
    }

    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get order total helper
  const getOrderTotal = (order: Order) => {
    if (order.type === 'regular') {
      return order.total || 0;
    } else {
      const total = parseFloat(order.orderDetails?.estimatedTotal?.replace(/[^\d.]/g, '') || '0');
      return total;
    }
  };

  // Get order title helper
  const getOrderTitle = (order: Order) => {
    if (order.type === 'regular') {
      return order.orderType === 'delivery' ? 'Food Delivery' : 'Food Order';
    } else {
      return `Screenshot Order - ${order.restaurantInfo?.name || 'Restaurant'}`;
    }
  };

  // Get order ID helper
  const getOrderId = (order: Order) => {
    if (order.type === 'regular') {
      return order.id.slice(-8);
    } else {
      return order.orderId || order.id.slice(-8);
    }
  };

  // Get order location helper
  const getOrderLocation = (order: Order) => {
    if (order.type === 'regular') {
      return order.deliveryInfo?.address || 'Fort Wayne';
    } else {
      return order.restaurantInfo?.pickupLocation || 'Fort Wayne';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'fulfilled':
      case 'delivered':
        return 'text-green-500';
      case 'pending':
      case 'pending_review':
      case 'confirmed':
        return 'text-yellow-500';
      case 'cancelled':
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-otw-gold" />
          <span className="ml-2 text-lg">Loading order history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="p-6 bg-red-900/20 border-red-500">
          <p className="text-red-400">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gray-900">
          <h3 className="text-lg font-semibold text-otw-gold mb-2">
            Total Orders
          </h3>
          <p className="text-3xl font-bold">{totalOrders}</p>
        </Card>
        <Card className="p-6 bg-gray-900">
          <h3 className="text-lg font-semibold text-otw-gold mb-2">
            Total Spent
          </h3>
          <p className="text-3xl font-bold">${totalSpent.toFixed(2)}</p>
        </Card>
        <Card className="p-6 bg-gray-900">
          <h3 className="text-lg font-semibold text-otw-gold mb-2">
            Completed Orders
          </h3>
          <p className="text-3xl font-bold">{completedOrders}</p>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>

        {totalOrders === 0 ? (
          <Card className="p-6">
            <div className="text-center py-8">
              <p className="text-lg text-gray-400 mb-4">No orders found</p>
              <p className="text-sm text-gray-500">Your order history will appear here once you place your first order.</p>
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                className="mt-4"
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Check for Orders
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">
                Showing {orders.length} of {pagination.total} orders
              </p>
            </div>

            {/* Unified Orders List */}
            {orders.map((order) => (
              <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{getOrderTitle(order)}</h3>
                      <span className="text-sm text-gray-400">#{getOrderId(order)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(order.type === 'regular' ? order.createdAt : order.timestamps?.created)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {getOrderLocation(order)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-otw-gold" />
                      <span className="font-semibold">${getOrderTotal(order).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`capitalize ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </div>
                      {order.type === 'screenshot' && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Screenshot Order
                        </span>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {/* Load More Button */}
            {pagination.hasMore && (
              <div className="text-center pt-4">
                <Button 
                  onClick={loadMore} 
                  variant="outline"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Load More Orders
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
