'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Clock, MapPin, DollarSign, Star, Loader2, RefreshCw, Search, Filter, Eye, RotateCcw, Truck, Package, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebase-config';
import { cn } from '../../lib/utils';
import { toast } from '../ui/use-toast';

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

  // Filter orders based on search and filters
  useEffect(() => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.restaurantInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(order => order.type === typeFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, typeFilter]);

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

  // Reorder function
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
      // Navigate to checkout with order items
      const itemsToReorder = order.cart || order.items || [];
      
      if (itemsToReorder.length > 0) {
        router.push(`/checkout?reorder=${encodeURIComponent(JSON.stringify(itemsToReorder))}`);
      } else {
        toast({
          title: 'No Items Found',
          description: 'No items found in this order to reorder.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error reordering:', error);
      toast({
        title: 'Reorder Failed',
        description: 'Failed to add items to cart. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsReordering(null);
    }
  }, [router]);

  // Track order function
  const handleTrackOrder = useCallback((order: Order) => {
    // Navigate to tracking page or open tracking modal
    window.open(`/track?orderId=${order.orderId || order.id}`, '_blank');
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
  }, []);

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
        minute: '2-digit',
      });
    } catch (error) {
      console.warn('Date formatting error:', error, 'for date:', date);
      return 'Invalid Date';
    }
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
          <div className="flex gap-3">
            <Button variant="default" size="sm" onClick={() => window.location.href = '/order'}>
              Browse Menu
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/restaurants'}>
              View Restaurants
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No filtered results
  if (!loading && !error && orders.length > 0 && filteredOrders.length === 0) {
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-otw-black-800/50 border-otw-black-700 text-white"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-otw-black-800/50 border-otw-black-700 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-otw-black-800/50 border-otw-black-700 text-white">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="screenshot">Screenshot</SelectItem>
              </SelectContent>
            </Select>
            
            {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <XCircle className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
          
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

        {/* No Results */}
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-500/10 flex items-center justify-center">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Orders Found</h3>
            <p className="text-gray-400 mb-6 max-w-md">
              No orders match your current filters. Try adjusting your search criteria.
            </p>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
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

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-otw-black-800/50 border-otw-black-700 text-white"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-otw-black-800/50 border-otw-black-700 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-otw-black-800/50 border-otw-black-700 text-white">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="screenshot">Screenshot</SelectItem>
            </SelectContent>
          </Select>
          
          {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <XCircle className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
        
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-otw-gold">Order History</h2>
          <p className="text-gray-400 text-sm mt-1">
            {filteredOrders.length} of {orders.length} orders
            {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && ' (filtered)'}
          </p>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="p-6 bg-otw-black-800/50 border-otw-black-700 hover:border-otw-gold/30 transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-white">
                    Order #{order.orderId || order.id.slice(-8).toUpperCase()}
                  </h3>
                  <Badge className={cn(
                    'text-xs font-medium',
                    getStatusColor(order.status)
                  )}>
                    {order.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-medium border-otw-gold/30 text-otw-gold">
                    {order.type === 'screenshot' ? 'SCREENSHOT' : 'REGULAR'}
                  </Badge>
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-otw-black-900 border-otw-black-700">
                    <DialogHeader>
                      <DialogTitle className="text-otw-gold">
                        Order #{order.orderId || order.id.slice(-8).toUpperCase()}
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Order details and status information
                      </DialogDescription>
                    </DialogHeader>
                    
                    {selectedOrder && (
                      <div className="space-y-6">
                        {/* Order Status */}
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'p-2 rounded-full',
                            selectedOrder.status === 'completed' || selectedOrder.status === 'delivered' 
                              ? 'bg-green-500/20' 
                              : selectedOrder.status === 'cancelled' 
                              ? 'bg-red-500/20' 
                              : 'bg-yellow-500/20'
                          )}>
                            {selectedOrder.status === 'completed' || selectedOrder.status === 'delivered' ? (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : selectedOrder.status === 'cancelled' ? (
                              <XCircle className="w-5 h-5 text-red-400" />
                            ) : (
                              <Clock className="w-5 h-5 text-yellow-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-semibold">
                              {selectedOrder.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {formatDate(selectedOrder.createdAt)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Order Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h4 className="text-white font-semibold">Order Information</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Order Type:</span>
                                <span className="text-white">{selectedOrder.type === 'screenshot' ? 'Screenshot' : 'Regular'}</span>
                              </div>
                              {selectedOrder.total && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Total:</span>
                                  <span className="text-white font-semibold">{formatCurrency(selectedOrder.total)}</span>
                                </div>
                              )}
                              {selectedOrder.orderDetails?.estimatedTotal && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Estimated Total:</span>
                                  <span className="text-white font-semibold">{selectedOrder.orderDetails.estimatedTotal}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {selectedOrder.restaurantInfo && (
                            <div className="space-y-4">
                              <h4 className="text-white font-semibold">Restaurant Information</h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-gray-400">Name:</span>
                                  <p className="text-white">{selectedOrder.restaurantInfo.name}</p>
                                </div>
                                {selectedOrder.restaurantInfo.pickupLocation && (
                                  <div>
                                    <span className="text-gray-400">Pickup Location:</span>
                                    <p className="text-white">{selectedOrder.restaurantInfo.pickupLocation}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Customer Information */}
                        {selectedOrder.customerInfo && (
                          <div className="space-y-4">
                            <h4 className="text-white font-semibold">Customer Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Name:</span>
                                <p className="text-white">{selectedOrder.customerInfo.name}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Phone:</span>
                                <p className="text-white">{selectedOrder.customerInfo.phone}</p>
                              </div>
                              <div className="md:col-span-2">
                                <span className="text-gray-400">Email:</span>
                                <p className="text-white">{selectedOrder.customerInfo.email}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Special Instructions */}
                        {selectedOrder.orderDetails?.specialInstructions && (
                          <div className="space-y-2">
                            <h4 className="text-white font-semibold">Special Instructions</h4>
                            <p className="text-gray-300 text-sm bg-otw-black-800/50 p-3 rounded-lg">
                              {selectedOrder.orderDetails.specialInstructions}
                            </p>
                          </div>
                        )}
                        
                        {/* Order Items */}
                        {(selectedOrder.cart || selectedOrder.items) && (
                          <div className="space-y-4">
                            <h4 className="text-white font-semibold">Order Items</h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {(selectedOrder.cart || selectedOrder.items || []).map((item: any, index: number) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-otw-black-800/30 rounded">
                                  <div>
                                    <p className="text-white text-sm">{item.name}</p>
                                    <p className="text-gray-400 text-xs">Qty: {item.quantity || 1}</p>
                                  </div>
                                  <p className="text-white text-sm font-semibold">
                                    {formatCurrency(item.price * (item.quantity || 1))}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                
                {['pending', 'processing', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status) && (
                  <Button variant="outline" size="sm" onClick={() => handleTrackOrder(order)}>
                    <Truck className="w-4 h-4 mr-2" />
                    Track
                  </Button>
                )}
                
                {(order.status === 'completed' || order.status === 'delivered') && (order.cart || order.items) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleReorder(order)}
                    disabled={isReordering === order.id}
                  >
                    {isReordering === order.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reorder
                      </>
                    )}
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
            className="bg-otw-black-800/50 border-otw-black-700 hover:border-otw-gold/30"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Package className="w-4 h-4 mr-2" />
                Load More Orders
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
