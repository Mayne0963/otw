'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdvancedAddressAutocomplete, { PlaceDetails } from '../../../components/AdvancedAddressAutocomplete';
import {
  ShoppingCart,
  Camera,
  Upload,
  MapPin,
  Clock,
  DollarSign,
  Plus,
  Minus,
  X,
  CheckCircle,
  AlertCircle,
  Phone,
  User,
  CreditCard,
  Package,
  Store,
  Receipt,
  MessageSquare,
  Info,
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
    deliveryInstructions: '',
  });
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
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
    { value: 'whole-foods', label: 'Whole Foods Market', deliveryFee: '$6.99' },
  ];

  const timeSlots = [
    { id: 'asap', time: 'ASAP', available: true },
    { id: '1hour', time: '1 Hour', available: true },
    { id: '2hours', time: '2 Hours', available: true },
    { id: '3hours', time: '3 Hours', available: false },
    { id: '4hours', time: '4 Hours', available: true },
    { id: 'evening', time: 'This Evening (6-8 PM)', available: true },
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
      <div className="min-h-screen bg-gradient-to-br from-otw-black via-gray-900 to-black flex items-center justify-center">
        <div className="bg-[--color-surface] border border-[--color-border] rounded-xl p-6 shadow-sm w-full max-w-md mx-4">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl text-[--color-onyx] font-bold mb-2">Order Submitted!</h2>
            <p className="text-[--color-muted] mb-6">
              Your grocery delivery order has been received and will be processed shortly.
            </p>
          </div>
          <div className="text-center space-y-4">
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-surface-strong)] to-[var(--color-surface)]">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-[var(--color-surface-strong)]">
        <div className="h-full bg-gradient-to-r from-[var(--color-harvest-gold)] to-[var(--otw-gold)] transition-all duration-500" style={{width: '75%'}}></div>
      </div>
      
      {/* Header */}
      <div className="bg-[var(--color-surface)]/80 backdrop-blur-lg shadow-lg border-b border-[var(--color-border)]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-[var(--otw-red)] to-[var(--color-harvest-gold)] rounded-xl flex items-center justify-center shadow-lg animate-float">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-onyx)] otw-text-gradient">Grocery Delivery</h1>
              <p className="text-[var(--color-muted)]">Order groceries from your favorite stores • Step 3 of 3</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Order Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Store Input */}
            <div className="form-section">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-[var(--color-harvest-gold)]" />
                <h2 className="text-[var(--color-harvest-gold)] text-sm font-semibold uppercase tracking-wide">Store Selection</h2>
              </div>
              <p className="text-[var(--color-muted)] text-sm mb-4">
                Choose your preferred grocery store
              </p>
              <div className="relative">
                <input
                  placeholder="e.g., Walmart, Target, Kroger..."
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="input-otw pl-12"
                  list="store-suggestions"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Package className="w-4 h-4 text-[var(--color-muted)]" />
                </div>
                <datalist id="store-suggestions">
                  <option key="walmart" value="Walmart" />
                  <option key="target" value="Target" />
                  <option key="kroger" value="Kroger" />
                  <option key="safeway" value="Safeway" />
                  <option key="whole-foods" value="Whole Foods" />
                  <option key="costco" value="Costco" />
                </datalist>
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-2 italic">Popular stores: Walmart, Target, Kroger, Safeway</p>
            </div>

            {/* Receipt Upload */}
            <div className="form-section">
              <div className="flex items-center gap-2 mb-3">
                <Camera className="w-5 h-5 text-[var(--color-harvest-gold)]" />
                <h2 className="text-[var(--color-harvest-gold)] text-sm font-semibold uppercase tracking-wide">Receipt Upload</h2>
              </div>
              <p className="text-[var(--color-muted)] text-sm mb-4">
                Upload a photo of your receipt showing the items you want to purchase
              </p>
              <div className="space-y-4">
                {!receiptPreview ? (
                  <div className="dropzone-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      className="hidden"
                      id="receipt-upload"
                    />
                    <label htmlFor="receipt-upload" className="cursor-pointer text-center w-full h-full flex flex-col items-center justify-center">
                      <div className="p-4 bg-[var(--color-harvest-gold)]/10 rounded-full mb-3">
                        <Upload className="w-8 h-8 text-[var(--color-harvest-gold)]" />
                      </div>
                      <p className="text-[var(--color-onyx)] font-medium mb-1">Drop your receipt here or click to browse</p>
                      <p className="text-[var(--color-muted)] text-sm">PNG, JPG up to 10MB</p>
                    </label>
                  </div>
                ) : (
                  <div className="relative animate-fade-in">
                    <div className="bg-[var(--color-surface-strong)] rounded-xl p-4 border border-[var(--color-border)]">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-[var(--color-onyx)] font-medium">Receipt uploaded successfully</p>
                          <p className="text-[var(--color-muted)] text-sm">{receipt?.name}</p>
                        </div>
                      </div>
                      <img
                        src={receiptPreview}
                        alt="Receipt"
                        className="w-full h-48 object-cover rounded-lg border border-[var(--color-border)] shadow-lg"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2 bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                        onClick={() => {
                          setReceipt(null);
                          setReceiptPreview('');
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Grocery List */}
            <div className="form-section">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart className="w-5 h-5 text-[var(--color-harvest-gold)]" />
                <h2 className="text-[var(--color-harvest-gold)] text-sm font-semibold uppercase tracking-wide">Grocery List</h2>
              </div>
              <p className="text-[var(--color-muted)] text-sm mb-4">
                Provide a list of items you want us to purchase for you
              </p>
              <div className="relative">
                <textarea
                  placeholder="Enter your grocery list here...&#10;&#10;Example:&#10;• 2 lbs bananas&#10;• 1 gallon milk (2%)&#10;• Bread (whole wheat)&#10;• 6 eggs&#10;• Chicken breast (2 lbs)&#10;• Spinach (1 bag)&#10;• Tomatoes (4 large)"
                  value={groceryList}
                  onChange={(e) => {
                    setGroceryList(e.target.value);
                    // Auto-resize textarea
                    const textarea = e.target as HTMLTextAreaElement;
                    textarea.style.height = 'auto';
                    textarea.style.height = Math.max(200, textarea.scrollHeight) + 'px';
                  }}
                  rows={8}
                  className="textarea-otw min-h-[200px] transition-all duration-200"
                  style={{ resize: 'none' }}
                />
                <div className="absolute bottom-3 right-3 text-xs text-[var(--color-muted)] bg-[var(--color-surface)]/80 px-2 py-1 rounded">
                  {groceryList.split('\n').filter(line => line.trim()).length} items
                </div>
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-2 italic">Tip: Be specific with quantities and preferences for better results</p>
            </div>

            {/* Special Instructions */}
            <div className="form-section">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-[var(--color-harvest-gold)]" />
                <h2 className="text-[var(--color-harvest-gold)] text-sm font-semibold uppercase tracking-wide">Special Instructions</h2>
              </div>
              <p className="text-[var(--color-muted)] text-sm mb-4">
                Any special requests or preferences for your order
              </p>
              <textarea
                placeholder="Enter any special instructions...&#10;&#10;Example:&#10;• Please choose ripe bananas&#10;• Organic produce preferred&#10;• No substitutions for dairy items&#10;• Call if items unavailable"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                rows={4}
                className="textarea-otw transition-all duration-200"
              />
              <p className="text-xs text-[var(--color-muted)] mt-2 italic">Optional: Help us serve you better with specific preferences</p>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <section className="relative z-0 overflow-visible space-y-6">
            {/* Customer Information */}
            <div className="form-section">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-[var(--color-harvest-gold)]" />
                <h2 className="text-[var(--color-harvest-gold)] text-sm font-semibold uppercase tracking-wide">Customer Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--color-onyx)] text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    className="input-otw"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-onyx)] text-sm font-medium mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    className="input-otw"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[var(--color-onyx)] text-sm font-medium mb-2">Email Address *</label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    className="input-otw"
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-3 italic">We'll use this information to contact you about your order</p>
            </div>

            {/* Delivery Address */}
            <div className="form-section">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-[var(--color-harvest-gold)]" />
                <h2 className="text-[var(--color-harvest-gold)] text-sm font-semibold uppercase tracking-wide">Delivery Address</h2>
              </div>
              <AdvancedAddressAutocomplete
                onPlaceSelect={(place) => {
                  setSelectedPlace(place);
                  setDeliveryAddress(place.formatted_address);
                }}
                placeholder="Enter your delivery address"
                className="w-full"
              />
              {deliveryAddress && (
                <div className="mt-4 p-4 bg-[var(--color-surface-strong)] rounded-lg border border-[var(--color-border)] transition-all duration-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-[var(--color-onyx)] mb-1">Delivery Address Confirmed:</h3>
                      <p className="text-sm text-[var(--color-muted)]">{deliveryAddress}</p>
                    </div>
                  </div>
                </div>
              )}
              <p className="text-xs text-[var(--color-muted)] mt-3 italic">We'll deliver your groceries to this address</p>
            </div>

            {/* Delivery Time */}
            <div className="form-section">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-[var(--color-harvest-gold)]" />
                <h2 className="text-[var(--color-harvest-gold)] text-sm font-semibold uppercase tracking-wide">Delivery Time</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--color-onyx)] text-sm font-medium mb-2">Preferred Date *</label>
                  <input
                    type="date"
                    value={deliveryTime.date}
                    onChange={(e) => setDeliveryTime({...deliveryTime, date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-otw"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-onyx)] text-sm font-medium mb-2">Time Slot *</label>
                  <select
                    value={deliveryTime.timeSlot}
                    onChange={(e) => setDeliveryTime({...deliveryTime, timeSlot: e.target.value})}
                    className="input-otw"
                    required
                  >
                    <option value="">Select a time slot</option>
                    {timeSlots.map((slot) => (
                      <option key={slot.id} value={slot.time} disabled={!slot.available}>
                        {slot.time} {!slot.available && '(Unavailable)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">Delivery Information:</p>
                    <ul className="text-xs space-y-1 text-blue-700 dark:text-blue-300">
                      <li>• Same-day delivery available for orders placed before 2 PM</li>
                      <li>• 2-hour delivery windows for your convenience</li>
                      <li>• We'll text you 30 minutes before arrival</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h2 className="text-[var(--color-harvest-gold)] text-sm font-semibold uppercase mb-2 tracking-wide">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Store:</span>
                  <span className="text-[var(--color-onyx)] font-medium">
                    {selectedStore || 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Receipt:</span>
                  <span className="text-[var(--color-onyx)] font-medium">
                    {receiptPreview ? 'Receipt uploaded' :
                      'No receipt uploaded'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Delivery Time:</span>
                  <span className="text-[var(--color-onyx)] font-medium">
                    {deliveryTime === 'Specific Time' && specificTime
                      ? `${deliveryTime} (${specificTime})`
                      : deliveryTime || 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Address:</span>
                  <span className="text-[var(--color-onyx)] font-medium text-right">
                    {deliveryAddress || 'Not set'}
                  </span>
                </div>
                <div className="border-t border-[var(--color-border)] pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-[var(--color-onyx)]">Service Fee:</span>
                    <span className="text-[var(--color-harvest-gold)]">$15.00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitOrder}
              disabled={isSubmitting || !selectedStore || !customerInfo.name || !customerInfo.phone || !deliveryAddress}
              className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-[var(--color-harvest-gold)] to-[var(--otw-gold)] text-black hover:from-[var(--otw-gold)] hover:to-[var(--color-harvest-gold)] transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                'Submit Order'
              )}
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}