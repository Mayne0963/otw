'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Package,
  Car,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Shield,
  DollarSign,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface ServiceDetails {
  type: 'grocery' | 'rides' | 'package';
  title: string;
  description: string;
  estimatedPrice: number;
  serviceDetails: any;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  specialInstructions: string;
}

interface PaymentMethod {
  type: 'card';
  label: string;
  description: string;
  icon: React.ReactNode;
}

export default function OTWCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [serviceDetails, setServiceDetails] = useState<ServiceDetails | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    specialInstructions: '',
  });
  const [selectedPayment, setSelectedPayment] = useState<'card' | null>('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });

  const paymentMethods: PaymentMethod[] = [
    {
      type: 'card',
      label: 'Pay with Card',
      description: 'Secure instant payment with your credit or debit card. Payment processed immediately upon order confirmation.',
      icon: <CreditCard className="w-6 h-6" />,
    },
  ];

  // Load service details from URL params or localStorage
  useEffect(() => {
    const serviceType = searchParams.get('service');
    const storedDetails = localStorage.getItem('otwServiceDetails');

    if (storedDetails) {
      setServiceDetails(JSON.parse(storedDetails));
    } else if (serviceType) {
      // Default service details based on type
      const defaultServices = {
        grocery: {
          type: 'grocery' as const,
          title: 'Grocery Shop & Drop',
          description: 'Personal grocery shopping and delivery service',
          estimatedPrice: 15.99,
          serviceDetails: {},
        },
        rides: {
          type: 'rides' as const,
          title: 'Local Rides',
          description: 'Door-to-door transportation service',
          estimatedPrice: 12.50,
          serviceDetails: {},
        },
        package: {
          type: 'package' as const,
          title: 'Package Delivery',
          description: 'Fast and secure package delivery',
          estimatedPrice: 8.99,
          serviceDetails: {},
        },
      };

      if (serviceType in defaultServices) {
        setServiceDetails(defaultServices[serviceType as keyof typeof defaultServices]);
      }
    }

    // Pre-fill user info if authenticated
    if (user) {
      setCustomerInfo(prev => ({
        ...prev,
        email: user.email || '',
        name: user.displayName || '',
      }));
    }
  }, [searchParams, user]);

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!(customerInfo.name && customerInfo.phone && customerInfo.email && customerInfo.address);
      case 2:
        return !!selectedPayment;
      case 3:
        return !!(cardDetails.number && cardDetails.expiry && cardDetails.cvv && cardDetails.name);
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      toast({
        title: 'Please complete all required fields',
        description: 'Fill in all the required information before proceeding.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitOrder = async () => {
    setIsProcessing(true);

    try {
      const orderData = {
        serviceDetails,
        customerInfo,
        paymentMethod: selectedPayment,
        cardDetails: selectedPayment === 'card' ? cardDetails : null,
        timestamp: new Date().toISOString(),
        userId: user?.uid || null,
      };

      // Process card payment
      const response = await fetch('/api/otw/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user ? `Bearer ${await user.getIdToken()}` : '',
        },
        body: JSON.stringify({
          serviceDetails,
          customerInfo,
          amount: Math.round(serviceDetails?.estimatedPrice * 100) || 0,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
        return;
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      toast({
        title: 'Order Submission Failed',
        description: 'There was an error processing your order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!serviceDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-otw-black via-gray-900 to-black flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-gray-900 border-otw-red/30">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-otw-gold mx-auto mb-4" />
            <CardTitle className="text-white">No Service Selected</CardTitle>
            <CardDescription className="text-gray-400">
              Please select a service before proceeding to checkout.
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

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-otw-black via-gray-900 to-black flex items-center justify-center">
        <Card className="w-full max-w-2xl mx-4 bg-gray-900 border-otw-gold/30">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-otw-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-otw-gold" />
            </div>
            <CardTitle className="text-2xl text-white mb-2">Order Confirmed!</CardTitle>
            <CardDescription className="text-gray-400">
              Your service request has been successfully submitted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-otw-black/50 p-6 rounded-lg border border-otw-gold/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Order ID</Label>
                  <p className="text-white font-mono">{orderId}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Service</Label>
                  <p className="text-white">{serviceDetails.title}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Payment Method</Label>
                  <p className="text-white">Card Payment</p>
                </div>
                <div>
                  <Label className="text-gray-400">Estimated Total</Label>
                  <p className="text-white font-semibold">${serviceDetails.estimatedPrice}</p>
                </div>
              </div>
            </div>

            <div className="bg-otw-red/10 p-4 rounded-lg border border-otw-red/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-otw-red mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold mb-1">What&apos;s Next?</h4>
                  <p className="text-gray-400 text-sm">
                    Your payment has been processed. A community helper will contact you shortly to arrange service delivery.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => router.push('/otw')}
                variant="outline"
                className="flex-1 border-otw-gold/50 text-otw-gold hover:bg-otw-gold/10"
              >
                Order Another Service
              </Button>
              <Button
                onClick={() => router.push('/orders')}
                className="flex-1 bg-otw-red hover:bg-otw-red/80"
              >
                View My Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-otw-black via-gray-900 to-black py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Complete Your Order
          </h1>
          <p className="text-gray-400">
            Secure checkout for your OTW service request
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= stepNumber
                    ? 'bg-otw-gold text-black'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    step > stepNumber ? 'bg-otw-gold' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Customer Information */}
            {step === 1 && (
              <Card className="bg-gray-900 border-otw-red/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <User className="w-5 h-5 text-otw-gold" />
                    Customer Information
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Please provide your contact details for service coordination.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-gray-300">Full Name *</Label>
                      <Input
                        id="name"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-otw-black/50 border-otw-gold/30 text-white focus:border-otw-gold"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-gray-300">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="bg-otw-black/50 border-otw-gold/30 text-white focus:border-otw-gold"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-otw-black/50 border-otw-gold/30 text-white focus:border-otw-gold"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-gray-300">Service Address *</Label>
                    <Input
                      id="address"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                      className="bg-otw-black/50 border-otw-gold/30 text-white focus:border-otw-gold"
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instructions" className="text-gray-300">Special Instructions</Label>
                    <Textarea
                      id="instructions"
                      value={customerInfo.specialInstructions}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, specialInstructions: e.target.value }))}
                      className="bg-otw-black/50 border-otw-gold/30 text-white focus:border-otw-gold"
                      placeholder="Any special instructions for the service provider..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <Card className="bg-gray-900 border-otw-red/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <CreditCard className="w-5 h-5 text-otw-gold" />
                    Payment Method
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Choose how you'd like to pay for your service.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.type}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedPayment === method.type
                          ? 'border-otw-gold bg-otw-gold/10'
                          : 'border-gray-700 bg-otw-black/30 hover:border-otw-gold/50'
                      }`}
                      onClick={() => setSelectedPayment(method.type)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${
                          selectedPayment === method.type
                            ? 'bg-otw-gold text-black'
                            : 'bg-gray-700 text-gray-400'
                        }`}>
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{method.label}</h3>
                          <p className="text-gray-400 text-sm">{method.description}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-otw-gold" />
                            <span className="text-xs text-otw-gold">256-bit SSL encryption • Instant confirmation</span>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedPayment === method.type
                            ? 'border-otw-gold bg-otw-gold'
                            : 'border-gray-600'
                        }`}>
                          {selectedPayment === method.type && (
                            <div className="w-2 h-2 bg-black rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment Details */}
            {step === 3 && (
              <Card className="bg-gray-900 border-otw-red/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <CreditCard className="w-5 h-5 text-otw-gold" />
                    Card Details
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Enter your payment information securely.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cardName" className="text-gray-300">Cardholder Name *</Label>
                    <Input
                      id="cardName"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-otw-black/50 border-otw-gold/30 text-white focus:border-otw-gold"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardNumber" className="text-gray-300">Card Number *</Label>
                    <Input
                      id="cardNumber"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                      className="bg-otw-black/50 border-otw-gold/30 text-white focus:border-otw-gold"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry" className="text-gray-300">Expiry Date *</Label>
                      <Input
                        id="expiry"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                        className="bg-otw-black/50 border-otw-gold/30 text-white focus:border-otw-gold"
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="text-gray-300">CVV *</Label>
                      <Input
                        id="cvv"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                        className="bg-otw-black/50 border-otw-gold/30 text-white focus:border-otw-gold"
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}



            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => step > 1 ? setStep(step - 1) : router.push('/otw')}
                className="border-otw-gold/50 text-otw-gold hover:bg-otw-gold/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {step > 1 ? 'Previous' : 'Back to Services'}
              </Button>

              {step < 3 ? (
                <Button
                  onClick={handleNextStep}
                  className="bg-otw-red hover:bg-otw-red/80"
                  disabled={!validateStep(step)}
                >
                  Continue
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitOrder}
                  className="bg-otw-gold text-black hover:bg-otw-gold/80"
                  disabled={isProcessing || !validateStep(step)}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Pay Now
                    </div>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-otw-gold/30 sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Package className="w-5 h-5 text-otw-gold" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {serviceDetails.type === 'grocery' && <ShoppingCart className="w-5 h-5 text-otw-red" />}
                    {serviceDetails.type === 'rides' && <Car className="w-5 h-5 text-otw-gold" />}
                    {serviceDetails.type === 'package' && <Package className="w-5 h-5 text-otw-red" />}
                    <div>
                      <h3 className="text-white font-semibold">{serviceDetails.title}</h3>
                      <p className="text-gray-400 text-sm">{serviceDetails.description}</p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-otw-gold/20" />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Service Fee</span>
                    <span className="text-white">${serviceDetails.estimatedPrice}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Platform Fee</span>
                    <span className="text-white">$0.00</span>
                  </div>
                  <Separator className="bg-gray-700" />
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span className="text-white">Total</span>
                    <span className="text-otw-gold">${serviceDetails.estimatedPrice}</span>
                  </div>
                </div>

                <Separator className="bg-otw-gold/20" />
                <div className="bg-otw-black/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-4 h-4 text-otw-gold" />
                    <span className="text-white text-sm font-semibold">
                      Card Payment
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs">
                    Secure payment processed immediately
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}