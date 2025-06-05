'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AddressSearch from '../../../components/AddressSearch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ShoppingCart, 
  Camera, 
  Upload, 
  Clock, 
  DollarSign,
  Plus,
  X,
  CheckCircle,
  User,
  CreditCard,
  Package
} from 'lucide-react';

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  deliveryInstructions: string;
}

export default function GroceryDeliveryPage() {
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [groceryList, setGroceryList] = useState<string>('');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    deliveryInstructions: ''
  });
  const [selectedStore, setSelectedStore] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [specificTime, setSpecificTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const stores = [
    { value: 'fresh-market', label: 'Fresh Market', deliveryFee: '$4.99' },
    { value: 'supermart', label: 'SuperMart', deliveryFee: '$3.99' },
    { value: 'organic-foods', label: 'Organic Foods Co.', deliveryFee: '$5.99' },
    { value: 'quick-stop', label: 'Quick Stop Grocery', deliveryFee: '$2.99' },
    { value: 'whole-foods', label: 'Whole Foods Market', deliveryFee: '$6.99' }
  ];

  const timeSlots = [
    'ASAP',
    '1 Hour',
    'Specific Time'
  ];



  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReceipt(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setReceiptPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };



  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setOrderSubmitted(true);
    setIsSubmitting(false);
  };

  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-otw-gold/10 via-white to-otw-red/10 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-otw-gold/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-otw-gold" />
            </div>
            <CardTitle className="text-2xl text-otw-red">Order Submitted!</CardTitle>
            <CardDescription className="text-gray-300">
              Your grocery delivery order has been received and will be processed shortly.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-otw-black/50 p-4 rounded-lg border border-otw-gold/20">
              <p className="text-sm text-gray-400">Order ID</p>
              <p className="font-mono text-lg font-semibold text-otw-gold">#GD{Date.now().toString().slice(-6)}</p>
            </div>
            <p className="text-sm text-gray-400">
              You'll receive updates via SMS and email. Expected delivery: {deliveryTime}
            </p>
            <Button className="w-full bg-otw-red hover:bg-otw-red/80 text-white" onClick={() => window.location.href = '/dashboard'}>
              Track Your Order
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-otw-black via-gray-900 to-black">
      {/* Header */}
      <div className="bg-gray-900 shadow-sm border-b border-otw-red/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-otw-red to-otw-gold rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Grocery Delivery</h1>
              <p className="text-gray-300">Order groceries from your favorite stores</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Order Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Store Input */}
            <Card className="bg-gray-900 border-otw-red/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Package className="w-5 h-5 text-otw-red" />
                  Store Name
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Enter the name of the store you want to order from
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="e.g., Walmart, Target, Kroger, etc."
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="bg-otw-black/50 border-otw-gold/30 text-white placeholder:text-gray-500 focus:border-otw-gold"
                />
              </CardContent>
            </Card>

            {/* Receipt Upload */}
            <Card className="bg-gray-900 border-otw-red/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Camera className="w-5 h-5 text-otw-gold" />
                  Upload Receipt
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Upload a photo of your receipt showing the items you want to purchase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-otw-gold/30 rounded-lg p-6 text-center hover:border-otw-gold/50 transition-colors bg-otw-black/30">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      className="hidden"
                      id="receipt-upload"
                    />
                    <label htmlFor="receipt-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-otw-gold mx-auto mb-2" />
                      <p className="text-sm text-white">Click to upload receipt</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                    </label>
                  </div>
                  
                  {receiptPreview && (
                    <div className="relative">
                      <img 
                        src={receiptPreview} 
                        alt="Receipt" 
                        className="w-full h-48 object-cover rounded-lg border border-otw-gold/30"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 bg-otw-red hover:bg-otw-red/80"
                        onClick={() => {
                          setReceipt(null);
                          setReceiptPreview('');
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Grocery List */}
            <Card className="bg-gray-900 border-otw-red/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Plus className="w-5 h-5 text-otw-gold" />
                  Grocery List
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Provide a list of items you want us to purchase for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your grocery list here...&#10;&#10;Example:&#10;- 2 lbs bananas&#10;- 1 gallon milk (2%)&#10;- Bread (whole wheat)&#10;- 6 eggs&#10;- Chicken breast (2 lbs)&#10;- Spinach (1 bag)&#10;- Tomatoes (4 large)"
                  value={groceryList}
                  onChange={(e) => setGroceryList(e.target.value)}
                  rows={8}
                  className="resize-none bg-otw-black/50 border-otw-gold/30 text-white placeholder:text-gray-500 focus:border-otw-gold"
                />
              </CardContent>
            </Card>

            {/* Special Instructions */}
            <Card className="bg-gray-900 border-otw-red/30">
              <CardHeader>
                <CardTitle className="text-white">Special Instructions</CardTitle>
                <CardDescription className="text-gray-400">
                  Any specific requests for your shopper
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="e.g., Please check expiration dates, prefer organic when available, substitute with similar items if unavailable..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={4}
                  className="bg-otw-black/50 border-otw-gold/30 text-white placeholder:text-gray-500 focus:border-otw-gold"
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card className="bg-gray-900 border-otw-red/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="w-5 h-5 text-otw-red" />
                  Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customer-name" className="text-gray-300">Full Name</Label>
                  <Input
                    id="customer-name"
                    placeholder="John Doe"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    className="bg-otw-black/50 border-otw-gold/30 text-white placeholder:text-gray-500 focus:border-otw-gold"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-phone" className="text-gray-300">Phone Number</Label>
                  <Input
                    id="customer-phone"
                    placeholder="(555) 123-4567"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    className="bg-otw-black/50 border-otw-gold/30 text-white placeholder:text-gray-500 focus:border-otw-gold"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-email" className="text-gray-300">Email</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    placeholder="john@example.com"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    className="bg-otw-black/50 border-otw-gold/30 text-white placeholder:text-gray-500 focus:border-otw-gold"
                  />
                </div>
                <div>
                  <Label htmlFor="delivery-address" className="text-gray-300">Delivery Address</Label>
                  <AddressSearch
                    onAddressSelect={(place) => {
                      setCustomerInfo({...customerInfo, address: place.formatted_address || ''});
                      console.log('Selected delivery address:', place);
                    }}
                    placeholder="Enter delivery address in Fort Wayne, IN..."
                    theme="dark"
                    size="md"
                    showIcon={true}
                    borderRadius="md"
                    focusColor="#FFD700"
                    customStyles="bg-otw-black/50 border-otw-gold/30 text-white placeholder:text-gray-500 focus:border-otw-gold"
                  />
                </div>
                <div>
                  <Label htmlFor="delivery-instructions" className="text-gray-300">Delivery Instructions</Label>
                  <Textarea
                    id="delivery-instructions"
                    placeholder="Leave at front door, ring doorbell, etc."
                    value={customerInfo.deliveryInstructions}
                    onChange={(e) => setCustomerInfo({...customerInfo, deliveryInstructions: e.target.value})}
                    rows={2}
                    className="bg-otw-black/50 border-otw-gold/30 text-white placeholder:text-gray-500 focus:border-otw-gold"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Time */}
            <Card className="bg-gray-900 border-otw-red/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Clock className="w-5 h-5 text-otw-gold" />
                  Delivery Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                  <SelectTrigger className="bg-otw-black/50 border-otw-gold/30 text-white focus:border-otw-gold">
                    <SelectValue placeholder="Select delivery time" className="text-gray-500" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(slot => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {deliveryTime === 'Specific Time' && (
                  <div>
                    <Label htmlFor="specific-time" className="text-gray-300">Specific Time</Label>
                    <Input
                      id="specific-time"
                      type="datetime-local"
                      value={specificTime}
                      onChange={(e) => setSpecificTime(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="bg-otw-black/50 border-otw-gold/30 text-white focus:border-otw-gold"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="bg-gray-900 border-otw-red/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <DollarSign className="w-5 h-5 text-otw-gold" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-otw-black/50 p-4 rounded-lg space-y-3 border border-otw-gold/20">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-300">Store:</span>
                    <span className="text-white">{selectedStore || 'Not selected'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-300">Items:</span>
                    <span className="text-white">
                      {receiptPreview ? 'Receipt uploaded' : 
                       groceryList ? 'Grocery list provided' : 'No items specified'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-300">Delivery Time:</span>
                    <span className="text-white">
                      {deliveryTime === 'Specific Time' && specificTime 
                        ? new Date(specificTime).toLocaleString()
                        : deliveryTime || 'Not selected'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-300">Customer:</span>
                    <span className="text-white">{customerInfo.name || 'Not provided'}</span>
                  </div>
                  
                  <div className="border-t border-otw-gold/20 pt-3">
                    <p className="text-sm text-gray-400">
                      Final pricing will be calculated based on actual items purchased and store prices.
                      You'll be charged only for items successfully obtained.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button 
              className="w-full h-12 text-lg bg-otw-red hover:bg-otw-red/80 text-white disabled:bg-gray-600 disabled:text-gray-400"
              onClick={() => {
                // Store service details in localStorage for checkout
                const serviceDetails = {
                  type: 'grocery' as const,
                  title: 'Grocery Shop & Drop',
                  description: 'Personal grocery shopping and delivery service',
                  estimatedPrice: 15.99,
                  serviceDetails: {
                    selectedStore,
                    deliveryTime,
                    receipt: receipt ? 'uploaded' : null,
                    groceryList: groceryList || null
                  }
                };
                
                const customerDetails = {
                  name: customerInfo.name,
                  phone: customerInfo.phone,
                  email: customerInfo.email,
                  address: customerInfo.address,
                  specialInstructions: `Store: ${selectedStore}, Delivery: ${deliveryTime}. ${receipt ? 'Receipt uploaded.' : ''} ${groceryList ? 'Grocery list provided.' : ''}`
                };
                
                localStorage.setItem('otwServiceDetails', JSON.stringify(serviceDetails));
                localStorage.setItem('otwCustomerInfo', JSON.stringify(customerDetails));
                
                // Navigate to checkout
                window.location.href = '/otw/checkout?service=grocery';
              }}
              disabled={!selectedStore || !customerInfo.name || !customerInfo.phone || !customerInfo.address || (!receiptPreview && !groceryList) || !deliveryTime}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Proceed to Checkout
              </div>
            </Button>

            <div className="text-xs text-gray-400 text-center">
              By placing this order, you agree to our terms of service and privacy policy.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}