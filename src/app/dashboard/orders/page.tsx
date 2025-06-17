'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { 
  Clock, 
  MapPin, 
  DollarSign, 
  Star, 
  Loader2, 
  RefreshCw, 
  Search, 
  Filter, 
  Eye, 
  RotateCcw, 
  Truck, 
  Package, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Calendar,
  Users,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/firebase-config';
import { cn } from '../../../lib/utils';
import { toast } from '../../../components/ui/use-toast';

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
  recentOrders: number;
  pendingOrders: number;
}

interface OrdersResponse {
  orders: Order[];
  summary: OrderSummary;
  hasMore: boolean;
}

export default function DashboardOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isReordering, setIsReordering] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState<OrderSummary>({
    totalOrders: 0,
    totalSpent: 0,
    completedOrders: 0,
    averageOrderValue: 0,
    recentOrders: 0,
    pendingOrders: 0,
  });
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    hasMore: false,
  });

  // Fetch orders with enhanced dashboard features
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

      if (!auth.currentUser) {
        throw new Error('Please sign in to view your orders.');
      }

      const idToken = await auth.currentUser.getIdToken(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`/api/orders/user?limit=${pagination.limit}&offset=${pagination.offset}&dashboard=true`, {
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
          setOrders([]);
          setSummary({
            totalOrders: 0,
            totalSpent: 0,
            completedOrders: 0,
            averageOrderValue: 0,
            recentOrders: 0,
            pendingOrders: 0,
          });
          return;
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: OrdersResponse = await response.json();
      
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
        recentOrders: 0,
        pendingOrders: 0,
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
        setError(err instanceof Error ? err.message : 'Failed to load orders. Please try again.');
      }
      
      setOrders([]);
      setSummary({
        totalOrders: 0,
        totalSpent: 0,
        completedOrders: 0,
        averageOrderValue: 0,
        recentOrders: 0,
        pendingOrders: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid, pagination.limit, pagination.offset]);

  // Filter orders
  useEffect(() => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.restaurantInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(order => order.type === typeFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, typeFilter]);

  // Initial load
  useEffect(() => {
    if (user?.uid) {
      fetchOrders();
    } else {
      setLoading(false);
      setError(null);
      setOrders([]);
    }
  }, [user?.uid]);

  const handleRefresh = useCallback(async () => {
    await fetchOrders(true);
  }, [fetchOrders]);

  const handleReorder = useCallback(async (order: Order) => {
    if (!order.cart && !order.items) {
      toast({
        title: 'Cannot Reorder',
        description: 'Order items are not available for reordering.',
        variant: 'destructive',
      });
      return;
    }

    setIsReordering(order.id);
    
    try {
      // Simulate reorder process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Order Added to Cart',
        description: 'Items from this order have been added to your cart.',
      });
      
      router.push('/cart');
    } catch (error) {
      toast({
        title: 'Reorder Failed',
        description: 'Unable to reorder at this time. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsReordering(null);
    }
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'out_for_delivery':
      case 'preparing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    
    try {
      let dateObj: Date;
      
      // Handle Firestore Timestamp objects
      if (date && typeof date === 'object' && typeof date.toDate === 'function') {
        dateObj = date.toDate();
      }
      // Handle Firebase Timestamp-like objects with seconds property
      else if (date && typeof date === 'object' && date.seconds) {
        dateObj = new Date(date.seconds * 1000);
      }
      // Handle Date objects
      else if (date instanceof Date) {
        dateObj = date;
      }
      // Handle string dates
      else if (typeof date === 'string') {
        dateObj = new Date(date);
      }
      // Handle numeric timestamps
      else if (typeof date === 'number') {
        dateObj = new Date(date);
      }
      else {
        return 'Invalid Date';
      }
      
      // Validate the resulting date
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Date formatting error:', error, 'for date:', date);
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Note: Authentication is now handled by the layout component

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Manage and track all your orders in one place
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{summary.totalOrders}</div>
            <p className="text-xs text-gray-400">
              {summary.recentOrders} in the last 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(summary.totalSpent)}</div>
            <p className="text-xs text-gray-400">
              Average: {formatCurrency(summary.averageOrderValue)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Completed Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{summary.completedOrders}</div>
            <p className="text-xs text-gray-400">
              {summary.totalOrders > 0 ? Math.round((summary.completedOrders / summary.totalOrders) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{summary.pendingOrders}</div>
            <p className="text-xs text-gray-400">
              Awaiting processing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-[#1A1A1A] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Filter Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders by ID, name, or restaurant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/50 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-black/50 border-white/20 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-white/20">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-black/50 border-white/20 text-white">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-white/20">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="regular">Regular Orders</SelectItem>
                <SelectItem value="screenshot">Screenshot Orders</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {error ? (
        <Card className="bg-[#1A1A1A] border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <XCircle className="h-16 w-16 text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Orders</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <Button onClick={() => fetchOrders()} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card className="bg-[#1A1A1A] border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {orders.length === 0 ? 'No Orders Yet' : 'No Matching Orders'}
            </h3>
            <p className="text-gray-400 mb-6">
              {orders.length === 0 
                ? 'Start ordering to see your order history here.' 
                : 'Try adjusting your search or filter criteria.'}
            </p>
            {orders.length === 0 && (
              <Button onClick={() => router.push('/restaurants')} className="bg-primary hover:bg-primary/90">
                Browse Restaurants
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="bg-[#1A1A1A] border-white/10 hover:border-white/20 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-white">
                        Order #{order.orderId || order.id.slice(-8)}
                      </h3>
                      <Badge className={cn("text-xs", getStatusColor(order.status))}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                        {order.type === 'screenshot' ? 'Screenshot' : 'Regular'}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(order.createdAt)}
                      </div>
                      {order.total && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatCurrency(order.total)}
                        </div>
                      )}
                      {order.restaurantInfo?.name && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {order.restaurantInfo.name}
                        </div>
                      )}
                    </div>
                    
                    {order.orderDetails?.specialInstructions && (
                      <p className="text-sm text-gray-400 italic">
                        "{order.orderDetails.specialInstructions}"
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-white/20 text-white hover:bg-white/10"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#1A1A1A] border-white/20 text-white max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Order Details</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Order #{selectedOrder?.orderId || selectedOrder?.id.slice(-8)}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedOrder && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-white mb-2">Order Information</h4>
                                <div className="space-y-1 text-sm text-gray-400">
                                  <p>Status: <Badge className={cn("ml-2", getStatusColor(selectedOrder.status))}>{selectedOrder.status}</Badge></p>
                                  <p>Type: {selectedOrder.type === 'screenshot' ? 'Screenshot Order' : 'Regular Order'}</p>
                                  <p>Date: {formatDate(selectedOrder.createdAt)}</p>
                                  {selectedOrder.total && <p>Total: {formatCurrency(selectedOrder.total)}</p>}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-white mb-2">Customer Information</h4>
                                <div className="space-y-1 text-sm text-gray-400">
                                  {selectedOrder.customerInfo?.name && <p>Name: {selectedOrder.customerInfo.name}</p>}
                                  {selectedOrder.customerInfo?.phone && <p>Phone: {selectedOrder.customerInfo.phone}</p>}
                                  {selectedOrder.customerInfo?.email && <p>Email: {selectedOrder.customerInfo.email}</p>}
                                </div>
                              </div>
                            </div>
                            
                            {selectedOrder.restaurantInfo && (
                              <div>
                                <h4 className="font-medium text-white mb-2">Restaurant Information</h4>
                                <div className="space-y-1 text-sm text-gray-400">
                                  <p>Name: {selectedOrder.restaurantInfo.name}</p>
                                  <p>Pickup Location: {selectedOrder.restaurantInfo.pickupLocation}</p>
                                </div>
                              </div>
                            )}
                            
                            {selectedOrder.orderDetails?.specialInstructions && (
                              <div>
                                <h4 className="font-medium text-white mb-2">Special Instructions</h4>
                                <p className="text-sm text-gray-400 italic">
                                  {selectedOrder.orderDetails.specialInstructions}
                                </p>
                              </div>
                            )}
                            
                            {(selectedOrder.cart || selectedOrder.items) && (
                              <div>
                                <h4 className="font-medium text-white mb-2">Order Items</h4>
                                <div className="space-y-2">
                                  {(selectedOrder.cart || selectedOrder.items || []).map((item: any, index: number) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-black/30 rounded">
                                      <span className="text-sm text-white">{item.name || item.title || 'Item'}</span>
                                      <div className="text-sm text-gray-400">
                                        {item.quantity && <span>Qty: {item.quantity} </span>}
                                        {item.price && <span>{formatCurrency(item.price)}</span>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    {(order.cart || order.items) && order.status !== 'cancelled' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10"
                        onClick={() => handleReorder(order)}
                        disabled={isReordering === order.id}
                      >
                        {isReordering === order.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4 mr-2" />
                        )}
                        Reorder
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {pagination.hasMore && (
            <div className="flex justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }));
                  fetchOrders();
                }}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Load More Orders
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}