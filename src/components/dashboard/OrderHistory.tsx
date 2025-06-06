'use client';

import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Clock, MapPin, DollarSign, Star, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase-config';

interface Order {
  id: string;
  userRef: string;
  total: number;
  status: string;
  createdAt: any;
  cart?: any[];
  stripeId?: string;
}

interface ScreenshotOrder {
  id: string;
  orderId: string;
  status: string;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
  };
  restaurantInfo: {
    name: string;
    pickupLocation: string;
  };
  orderDetails: {
    estimatedTotal: string;
    specialInstructions: string;
  };
  timestamps: {
    created: string;
    updated?: string;
  };
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [screenshotOrders, setScreenshotOrders] = useState<ScreenshotOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch regular orders
        const ordersQuery = query(
          collection(db, 'orders'),
          where('userRef', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(20),
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];

        // Fetch screenshot orders
        const screenshotOrdersQuery = query(
          collection(db, 'screenshot_orders'),
          where('customerInfo.email', '==', user.email || ''),
          orderBy('timestamps.created', 'desc'),
          limit(20),
        );
        const screenshotOrdersSnapshot = await getDocs(screenshotOrdersQuery);
        const screenshotOrdersData = screenshotOrdersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as ScreenshotOrder[];

        setOrders(ordersData);
        setScreenshotOrders(screenshotOrdersData);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load order history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Calculate statistics
  const totalOrders = orders.length + screenshotOrders.length;
  const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0) +
    screenshotOrders.reduce((sum, order) => {
      const total = parseFloat(order.orderDetails?.estimatedTotal?.replace(/[^\d.]/g, '') || '0');
      return sum + total;
    }, 0);

  // For now, we'll show a placeholder for average rating since we don't have rating data
  const avgRating = 'N/A';

  // Format date helper
  const formatDate = (date: any) => {
    if (!date) {return 'Unknown';}

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
    });
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
            Avg Rating
          </h3>
          <p className="text-3xl font-bold">{avgRating}</p>
        </Card>
      </div>

      <div className="space-y-4">
        {totalOrders === 0 ? (
          <Card className="p-6">
            <div className="text-center py-8">
              <p className="text-lg text-gray-400 mb-4">No orders found</p>
              <p className="text-sm text-gray-500">Your order history will appear here once you place your first order.</p>
            </div>
          </Card>
        ) : (
          <>
            {/* Regular Orders */}
            {orders.map((order) => (
              <Card key={`order-${order.id}`} className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">Food Order</h3>
                      <span className="text-sm text-gray-400">#{order.id.slice(-8)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Fort Wayne
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-otw-gold" />
                      <span className="font-semibold">${order.total?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className={`capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {/* Screenshot Orders */}
            {screenshotOrders.map((order) => (
              <Card key={`screenshot-${order.id}`} className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">Screenshot Order - {order.restaurantInfo?.name || 'Restaurant'}</h3>
                      <span className="text-sm text-gray-400">#{order.orderId}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(order.timestamps?.created)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {order.restaurantInfo?.pickupLocation || 'Fort Wayne'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-otw-gold" />
                      <span className="font-semibold">{order.orderDetails?.estimatedTotal || '$0.00'}</span>
                    </div>
                    <div className={`capitalize ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
