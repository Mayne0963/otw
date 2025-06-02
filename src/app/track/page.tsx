'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { CheckCircle, Clock, MapPin, User, AlertCircle } from 'lucide-react';

const statusSteps = [
  {
    id: "received",
    title: "Order Received",
    icon: Clock,
    description: "We've received your order",
  },
  {
    id: "confirmed",
    title: "Order Confirmed",
    icon: CheckCircle,
    description: "Your order has been confirmed",
  },
  {
    id: "preparing",
    title: "Preparing",
    icon: User,
    description: "Your order is being prepared",
  },
  {
    id: "out_for_delivery",
    title: "Out for Delivery",
    icon: MapPin,
    description: "Your order is on the way",
  },
  {
    id: "delivered",
    title: "Delivered",
    icon: CheckCircle,
    description: "Order delivered successfully",
  },
];

export default function TrackPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrderData(null);
    
    if (!orderId.trim() || !email.trim()) {
      setError('Please enter both Order ID and email address');
      return;
    }

    setIsLoading(true);
    
    try {
      // Mock verification - replace with actual API call
      // This would verify the order belongs to the customer
      const mockOrderData = {
        orderId: orderId,
        customerEmail: email,
        status: 'preparing',
        estimatedDelivery: '7:30 PM',
        items: ['2x Pepperoni Pizza', '1x Garlic Bread'],
        total: 28.99,
        address: '123 Main St, Fort Wayne, IN'
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation - in real implementation, verify email matches order
      if (email.toLowerCase() === 'test@example.com' || email.includes('@')) {
        setOrderData(mockOrderData);
      } else {
        setError('Order not found or email does not match our records');
      }
    } catch (error) {
      setError('Unable to track order. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-otw-gold mb-2">
            Track Your Order
          </h1>
          <p className="text-lg text-gray-300">
            Enter your order details to track your delivery in real-time.
          </p>
        </div>

        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Order Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrack} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Order ID
                </label>
                <Input
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter your order ID (e.g., OTW-2024-001)"
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter the email used for this order"
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
              {error && (
                <Alert className="bg-red-900/20 border-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-otw-gold hover:bg-yellow-600 text-black font-semibold"
              >
                {isLoading ? 'Tracking...' : 'Track Order'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {orderData && (
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Order Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400">Order ID</p>
                    <p className="text-white font-semibold">{orderData.orderId}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Estimated Delivery</p>
                    <p className="text-white font-semibold">{orderData.estimatedDelivery}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total</p>
                    <p className="text-white font-semibold">${orderData.total}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Delivery Address</p>
                    <p className="text-white font-semibold">{orderData.address}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-gray-400 mb-2">Items</p>
                  <div className="space-y-1">
                    {orderData.items.map((item: string, index: number) => (
                      <p key={index} className="text-white">{item}</p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-8 top-0 h-full w-0.5 bg-gray-700" />
                  <div className="space-y-8">
                    {statusSteps.map((step) => {
                      const isActive = statusSteps
                        .slice(0, statusSteps.findIndex((s) => s.id === orderData.status) + 1)
                        .map((s) => s.id)
                        .includes(step.id);

                      return (
                        <div key={step.id} className="relative flex items-start gap-4">
                          <div
                            className={`relative z-10 rounded-full p-2 ${
                              isActive ? "bg-otw-gold text-black" : "bg-gray-800 text-gray-400"
                            }`}
                          >
                            <step.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h3
                              className={`font-semibold ${
                                isActive ? "text-otw-gold" : "text-gray-400"
                              }`}
                            >
                              {step.title}
                            </h3>
                            <p className="text-sm text-gray-500">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
