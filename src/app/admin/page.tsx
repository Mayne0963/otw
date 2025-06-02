'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Clock, MapPin, User, Package, DollarSign, Search, Filter, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderType: 'food' | 'grocery' | 'package' | 'ride';
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  items: string[];
  total: number;
  address: string;
  estimatedDeliveryTime: string;
  createdAt: string;
  assignedDriver?: string;
  specialInstructions?: string;
}

const ADMIN_EMAILS = [
  'admin@otw.com',
  'manager@otw.com',
  'supervisor@otw.com'
];

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Check if user is admin
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/signin?redirect=/admin');
      return;
    }

    if (!isLoading && user && !isAdmin) {
      router.push('/');
      return;
    }

    if (isAdmin) {
      fetchOrders();
    }
  }, [user, isLoading, isAdmin, router]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, typeFilter]);

  const fetchOrders = async () => {
    try {
      setIsLoadingOrders(true);
      // Mock data for demonstration - replace with actual API call
      const mockOrders: Order[] = [
        {
          id: '1',
          orderId: 'OTW-2024-001',
          customerName: 'John Doe',
          customerPhone: '(260) 555-0123',
          customerEmail: 'john@example.com',
          orderType: 'food',
          status: 'preparing',
          items: ['2x Pepperoni Pizza', '1x Garlic Bread', '2x Coke'],
          total: 28.99,
          address: '123 Main St, Fort Wayne, IN',
          estimatedDeliveryTime: '7:30 PM',
          createdAt: '2024-01-15T18:45:00Z',
          assignedDriver: 'Mike Johnson',
          specialInstructions: 'Ring doorbell twice'
        },
        {
          id: '2',
          orderId: 'OTW-2024-002',
          customerName: 'Sarah Smith',
          customerPhone: '(260) 555-0456',
          customerEmail: 'sarah@example.com',
          orderType: 'grocery',
          status: 'pending',
          items: ['Milk', 'Bread', 'Eggs', 'Bananas'],
          total: 15.47,
          address: '456 Oak Ave, Fort Wayne, IN',
          estimatedDeliveryTime: '8:00 PM',
          createdAt: '2024-01-15T19:15:00Z',
          specialInstructions: 'Leave at front door'
        },
        {
          id: '3',
          orderId: 'OTW-2024-003',
          customerName: 'Mike Wilson',
          customerPhone: '(260) 555-0789',
          customerEmail: 'mike@example.com',
          orderType: 'package',
          status: 'out_for_delivery',
          items: ['Package from Amazon'],
          total: 5.99,
          address: '789 Pine St, Fort Wayne, IN',
          estimatedDeliveryTime: '7:45 PM',
          createdAt: '2024-01-15T17:30:00Z',
          assignedDriver: 'Sarah Chen'
        }
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled');

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(order => order.orderType === typeFilter);
    }

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'confirmed': return 'bg-blue-500/20 text-blue-400';
      case 'preparing': return 'bg-orange-500/20 text-orange-400';
      case 'out_for_delivery': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'food': return '🍕';
      case 'grocery': return '🛒';
      case 'package': return '📦';
      case 'ride': return '🚗';
      default: return '📋';
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Mock update - replace with actual API call
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus as any } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-white mb-4">You don't have permission to access this page.</p>
          <Link href="/" className="text-otw-gold hover:underline">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-otw-gold mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">Manage all active orders and deliveries</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Active Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{filteredOrders.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {filteredOrders.filter(o => o.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Out for Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {filteredOrders.filter(o => o.status === 'out_for_delivery').length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-otw-gold">
                ${filteredOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="food">Food Delivery</SelectItem>
                  <SelectItem value="grocery">Grocery</SelectItem>
                  <SelectItem value="package">Package</SelectItem>
                  <SelectItem value="ride">Ride</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchOrders} variant="outline" className="border-gray-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {isLoadingOrders ? (
            <div className="text-center py-8">
              <div className="text-gray-400">Loading orders...</div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="text-center py-8">
                <div className="text-gray-400">No active orders found</div>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">{getTypeIcon(order.orderType)}</span>
                        {order.orderId}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {new Date(order.createdAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Customer
                      </h4>
                      <p className="text-gray-300">{order.customerName}</p>
                      <p className="text-gray-400 text-sm">{order.customerPhone}</p>
                      <p className="text-gray-400 text-sm">{order.customerEmail}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Delivery Address
                      </h4>
                      <p className="text-gray-300">{order.address}</p>
                      <p className="text-gray-400 text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ETA: {order.estimatedDeliveryTime}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Order Details
                      </h4>
                      <div className="text-gray-300 text-sm space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index}>{item}</div>
                        ))}
                      </div>
                      <p className="text-otw-gold font-semibold mt-2 flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  {order.assignedDriver && (
                    <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-300">
                        <strong>Assigned Driver:</strong> {order.assignedDriver}
                      </p>
                    </div>
                  )}
                  
                  {order.specialInstructions && (
                    <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-300">
                        <strong>Special Instructions:</strong> {order.specialInstructions}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-4 flex gap-2">
                    {order.status === 'pending' && (
                      <Button 
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Confirm Order
                      </Button>
                    )}
                    {order.status === 'confirmed' && (
                      <Button 
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Start Preparing
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button 
                        onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Out for Delivery
                      </Button>
                    )}
                    {order.status === 'out_for_delivery' && (
                      <Button 
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="bg-otw-gold hover:bg-yellow-600 text-black"
                      >
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}