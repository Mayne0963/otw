'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/alert-dialog';
import { Label } from '../../../components/ui/label';
import { Camera, Phone, Mail, MapPin, DollarSign, Clock, User, FileText, RefreshCw } from 'lucide-react';
import Image from 'next/image';

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
    screenshotUrl: string;
    originalFileName: string;
  };
  timestamps: {
    created: string;
    updated: string;
  };
  workflow: {
    reviewRequired: boolean;
    confirmationCalled: boolean;
    orderPlaced: boolean;
    pickedUp: boolean;
    delivered: boolean;
  };
  adminNotes?: string;
  lastUpdatedBy?: string;
}

const statusColors = {
  pending_review: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  order_placed: 'bg-purple-100 text-purple-800',
  picked_up: 'bg-orange-100 text-orange-800',
  out_for_delivery: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  failed: 'bg-gray-100 text-gray-800',
};

const statusOptions = [
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'order_placed', label: 'Order Placed' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'failed', label: 'Failed' },
];

export default function ScreenshotOrdersAdmin() {
  const [orders, setOrders] = useState<ScreenshotOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ScreenshotOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      params.append('limit', '100');

      const response = await fetch(`/api/orders/screenshot?${params}`);
      const data = await response.json();

      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder || !updateStatus) {return;}

    try {
      setUpdating(true);
      const response = await fetch('/api/orders/screenshot', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          status: updateStatus,
          notes: updateNotes,
          adminId: 'admin', // In a real app, this would be the logged-in admin's ID
        }),
      });

      if (response.ok) {
        // Refresh orders
        await fetchOrders();
        // Reset form
        setUpdateStatus('');
        setUpdateNotes('');
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const filteredOrders = orders.filter(order => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.orderId.toLowerCase().includes(searchLower) ||
        order.customerInfo.name.toLowerCase().includes(searchLower) ||
        order.customerInfo.phone.includes(searchTerm) ||
        order.restaurantInfo.name.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Screenshot Orders</h1>
            <p className="text-gray-600 mt-2">Manage customer screenshot orders</p>
          </div>
          <Button onClick={fetchOrders} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Orders</Label>
                <Input
                  id="search"
                  placeholder="Search by order ID, customer name, phone, or restaurant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <Label htmlFor="status-filter">Filter by Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No orders found</p>
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Order Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{order.orderId}</h3>
                            <p className="text-sm text-gray-500">
                              Created: {formatDate(order.timestamps.created)}
                            </p>
                          </div>
                          <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                            {statusOptions.find(s => s.value === order.status)?.label || order.status}
                          </Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{order.customerInfo.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{order.customerInfo.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{order.customerInfo.email}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{order.restaurantInfo.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{order.restaurantInfo.pickupLocation}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium">{order.orderDetails.estimatedTotal}</span>
                            </div>
                          </div>
                        </div>

                        {order.orderDetails.specialInstructions && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium">Special Instructions:</span>
                            </div>
                            <p className="text-sm text-gray-600">{order.orderDetails.specialInstructions}</p>
                          </div>
                        )}
                      </div>

                      {/* Screenshot Preview */}
                      <div className="lg:w-64">
                        <div className="bg-gray-100 rounded-lg p-4 h-full">
                          <h4 className="text-sm font-medium mb-2">Order Screenshot</h4>
                          <div className="relative aspect-square bg-white rounded border">
                            <Image
                              src={order.orderDetails.screenshotUrl}
                              alt="Order screenshot"
                              fill
                              className="object-contain rounded"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2 truncate">
                            {order.orderDetails.originalFileName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center mt-6 pt-4 border-t">
                      <div className="flex gap-2">
                        {/* Workflow indicators */}
                        {order.workflow.confirmationCalled && (
                          <Badge variant="outline" className="text-xs">
                            <Phone className="h-3 w-3 mr-1" />
                            Called
                          </Badge>
                        )}
                        {order.workflow.orderPlaced && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Placed
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                            onClick={() => {
                              setSelectedOrder(order);
                              setUpdateStatus(order.status);
                              setUpdateNotes(order.adminNotes || '');
                            }}
                          >
                            Update Status
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Update Order Status</AlertDialogTitle>
                              <AlertDialogDescription>
                                Update the status and add notes for order {order.orderId}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="status">Status</Label>
                                <Select value={updateStatus} onValueChange={setUpdateStatus}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {statusOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="notes">Admin Notes</Label>
                                <Textarea
                                  id="notes"
                                  placeholder="Add notes about this order..."
                                  value={updateNotes}
                                  onChange={(e) => setUpdateNotes(e.target.value)}
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  onClick={() => setSelectedOrder(null)}
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={updateOrderStatus}
                                  disabled={updating || !updateStatus}
                                >
                                  {updating ? 'Updating...' : 'Update'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`tel:${order.customerInfo.phone}`)}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}