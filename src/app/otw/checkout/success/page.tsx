'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Package,
  Car,
  ShoppingCart,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface OrderDetails {
  orderId: string;
  serviceDetails: {
    type: 'grocery' | 'rides' | 'package';
    title: string;
    description: string;
  };
  customerInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
    specialInstructions: string;
  };
  paymentStatus: string;
  orderStatus: string;
  actualPrice: number;
  createdAt: string;
}

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const verifyPaymentAndFetchOrder = async () => {
      if (!sessionId || !orderId) {
        setError('Missing payment session information');
        setLoading(false);
        return;
      }

      try {
        // Verify payment with Stripe and get order details
        const response = await fetch('/api/otw/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': user ? `Bearer ${await user.getIdToken()}` : '',
          },
          body: JSON.stringify({
            sessionId,
            orderId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setOrderDetails(data.order);

          toast({
            title: 'Payment Successful!',
            description: 'Your order has been confirmed and will be processed shortly.',
          });
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to verify payment');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setError('Failed to verify payment status');
      } finally {
        setLoading(false);
      }
    };

    verifyPaymentAndFetchOrder();
  }, [sessionId, orderId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-otw-black via-gray-900 to-black flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-gray-900 border-otw-gold/30">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-otw-gold border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">Verifying Payment</h3>
            <p className="text-gray-400 text-center">Please wait while we confirm your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-otw-black via-gray-900 to-black flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-gray-900 border-otw-red/30">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-otw-red mx-auto mb-4" />
            <CardTitle className="text-white">Payment Verification Failed</CardTitle>
            <CardDescription className="text-gray-400">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => router.push('/otw')}
              className="w-full bg-otw-red hover:bg-otw-red/80"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Services
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full border-otw-gold/50 text-otw-gold hover:bg-otw-gold/10"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-otw-black via-gray-900 to-black flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-gray-900 border-otw-red/30">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-otw-red mx-auto mb-4" />
            <CardTitle className="text-white">Order Not Found</CardTitle>
            <CardDescription className="text-gray-400">
              We couldn't find your order details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/otw')}
              className="w-full bg-otw-red hover:bg-otw-red/80"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Services
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'grocery':
        return <ShoppingCart className="w-6 h-6 text-otw-red" />;
      case 'rides':
        return <Car className="w-6 h-6 text-otw-gold" />;
      case 'package':
        return <Package className="w-6 h-6 text-otw-red" />;
      default:
        return <Package className="w-6 h-6 text-otw-red" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-otw-black via-gray-900 to-black py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-otw-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-otw-gold" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-400 text-lg">
            Your order has been confirmed and will be processed shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <Card className="bg-gray-900 border-otw-gold/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                {getServiceIcon(orderDetails.serviceDetails.type)}
                Order Details
              </CardTitle>
              <CardDescription className="text-gray-400">
                Order #{orderDetails.orderId}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Service Information */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {orderDetails.serviceDetails.title}
                  </h3>
                  <p className="text-gray-400">
                    {orderDetails.serviceDetails.description}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className="border-otw-gold/50 text-otw-gold"
                  >
                    <CreditCard className="w-3 h-3 mr-1" />
                    Paid
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-otw-red/50 text-otw-red"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {orderDetails.orderStatus === 'confirmed' ? 'Confirmed' : 'Processing'}
                  </Badge>
                </div>
              </div>

              <Separator className="bg-otw-gold/20" />

              {/* Payment Information */}
              <div className="space-y-2">
                <h4 className="text-white font-semibold">Payment Summary</h4>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Service Fee</span>
                  <span className="text-white">${orderDetails.actualPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Platform Fee</span>
                  <span className="text-white">$0.00</span>
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span className="text-white">Total Paid</span>
                  <span className="text-otw-gold">${orderDetails.actualPrice.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card className="bg-gray-900 border-otw-red/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="w-5 h-5 text-otw-gold" />
                Service Details
              </CardTitle>
              <CardDescription className="text-gray-400">
                Information for service delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Contact */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-otw-gold" />
                  <div>
                    <p className="text-white font-medium">{orderDetails.customerInfo.name}</p>
                    <p className="text-gray-400 text-sm">Customer</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-otw-gold" />
                  <div>
                    <p className="text-white font-medium">{orderDetails.customerInfo.phone}</p>
                    <p className="text-gray-400 text-sm">Phone Number</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-otw-gold" />
                  <div>
                    <p className="text-white font-medium">{orderDetails.customerInfo.email}</p>
                    <p className="text-gray-400 text-sm">Email Address</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-otw-gold mt-1" />
                  <div>
                    <p className="text-white font-medium">{orderDetails.customerInfo.address}</p>
                    <p className="text-gray-400 text-sm">Service Address</p>
                  </div>
                </div>

                {orderDetails.customerInfo.specialInstructions && (
                  <div className="bg-otw-black/50 p-3 rounded-lg border border-otw-gold/20">
                    <h5 className="text-white font-semibold text-sm mb-1">Special Instructions</h5>
                    <p className="text-gray-400 text-sm">{orderDetails.customerInfo.specialInstructions}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="mt-8 bg-otw-red/10 border-otw-red/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-otw-red/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-otw-red" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">What Happens Next?</h3>
                <div className="space-y-2 text-gray-400 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-otw-gold rounded-full" />
                    <span>Your payment has been processed successfully</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-otw-gold rounded-full" />
                    <span>A community helper will be assigned to your request</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-otw-gold rounded-full" />
                    <span>You&apos;ll receive a call/text to confirm details and timing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-otw-gold rounded-full" />
                    <span>Service will be completed as requested</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button
            onClick={() => router.push('/otw')}
            variant="outline"
            className="border-otw-gold/50 text-otw-gold hover:bg-otw-gold/10"
          >
            Order Another Service
          </Button>
          <Button
            onClick={() => router.push('/orders')}
            className="bg-otw-red hover:bg-otw-red/80"
          >
            View My Orders
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="border-gray-600 text-gray-400 hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}