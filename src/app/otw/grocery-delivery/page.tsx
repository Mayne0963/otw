'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import AdvancedAddressAutocomplete, { PlaceDetails } from '../../../components/AdvancedAddressAutocomplete';
import { ModernGoogleMapsProvider } from '../../../contexts/ModernGoogleMapsContext';
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
  Trash2
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../lib/context/CartContext';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  deliveryInstructions: string;
}

function GroceryDeliveryPageContent() {
  const { user } = useAuth();
  const { addItem } = useCart();
  
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [groceryList, setGroceryList] = useState<string>('');
  const [parsedItems, setParsedItems] = useState<Array<{id: string, name: string, quantity: number, price: number}>>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    deliveryInstructions: '',
  });
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [selectedStore, setSelectedStore] = useState('');
  const [deliveryTime, setDeliveryTime] = useState({ date: '', timeSlot: '' });
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [showCartIntegration] = useState(false);
  
  // Auto-fill customer info if user is logged in
  useEffect(() => {
    if (user) {
      setCustomerInfo(prev => ({
        ...prev,
        name: user.displayName || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);



  // Generate dynamic time slots based on current time and store hours
  const generateTimeSlots = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const slots = [];

    // Store hours: 8 AM to 10 PM
    const storeOpenHour = 8;
    const storeCloseHour = 22;

    // If it's before store hours, start from store opening
    let startHour = currentHour < storeOpenHour ? storeOpenHour : currentHour;
    let startMinutes = currentHour < storeOpenHour ? 0 : currentMinutes;

    // Round up to next 30-minute interval
    if (startMinutes > 0 && startMinutes <= 30) {
      startMinutes = 30;
    } else if (startMinutes > 30) {
      startHour += 1;
      startMinutes = 0;
    }

    // Add ASAP option if store is open and it's not too late
    if (currentHour >= storeOpenHour && currentHour < storeCloseHour - 1) {
      slots.push({
        id: 'asap',
        time: 'ASAP (30-45 min)',
        available: true,
        value: 'asap'
      });
    }

    // Generate 30-minute slots for today
    const today = new Date();
    for (let hour = startHour; hour < storeCloseHour; hour++) {
      for (let minutes of [0, 30]) {
        if (hour === startHour && minutes < startMinutes) continue;
        
        const slotTime = new Date(today);
        slotTime.setHours(hour, minutes, 0, 0);
        
        // Skip if slot is in the past
        if (slotTime <= now) continue;
        
        const timeString = slotTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        slots.push({
          id: `today-${hour}-${minutes}`,
          time: `Today ${timeString}`,
          available: true,
          value: `today-${hour}-${minutes}`
        });
      }
    }

    // Add tomorrow slots
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    for (let hour = storeOpenHour; hour < storeCloseHour; hour++) {
      for (let minutes of [0, 30]) {
        const slotTime = new Date(tomorrow);
        slotTime.setHours(hour, minutes, 0, 0);
        
        const timeString = slotTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        slots.push({
          id: `tomorrow-${hour}-${minutes}`,
          time: `Tomorrow ${timeString}`,
          available: true,
          value: `tomorrow-${hour}-${minutes}`
        });
      }
    }

    // Add day after tomorrow slots
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    const dayAfterName = dayAfter.toLocaleDateString('en-US', { weekday: 'long' });
    
    for (let hour = storeOpenHour; hour < storeCloseHour; hour++) {
      for (let minutes of [0, 30]) {
        const slotTime = new Date(dayAfter);
        slotTime.setHours(hour, minutes, 0, 0);
        
        const timeString = slotTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        slots.push({
          id: `dayafter-${hour}-${minutes}`,
          time: `${dayAfterName} ${timeString}`,
          available: true,
          value: `dayafter-${hour}-${minutes}`
        });
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Parse grocery list into structured items
  const parseGroceryList = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const items = lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      // Try to extract quantity and price from common formats
      // Examples: "2x Apples - $3.50", "Milk $4.99", "3 Bananas", "Bread"
      const quantityMatch = trimmedLine.match(/^(\d+)\s*[x×]?\s*(.+)/);
      const priceMatch = trimmedLine.match(/\$([\d.]+)/);
      
      let quantity = 1;
      let name = trimmedLine;
      let price = 0;
      
      if (quantityMatch) {
        quantity = parseInt(quantityMatch[1]);
        name = quantityMatch[2].replace(/\s*-\s*\$[\d.]+$/, '').trim();
      } else {
        name = trimmedLine.replace(/\s*-\s*\$[\d.]+$/, '').trim();
      }
      
      if (priceMatch) {
        price = parseFloat(priceMatch[1]);
      } else {
        // Estimate price if not provided (this could be enhanced with a product database)
        price = Math.round((Math.random() * 8 + 2) * 100) / 100; // Random price between $2-$10
      }
      
      return {
        id: `grocery-${index}-${Date.now()}`,
        name: name,
        quantity: quantity,
        price: price
      };
    });
    
    return items;
  };

  // Add parsed items to cart
  const addItemsToCart = () => {
    const items = parseGroceryList(groceryList);
    
    items.forEach(item => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        store: selectedStore || 'Grocery Store',
        image: undefined,
        description: 'Grocery item',
        customizations: {}
      });
    });
    
    toast({
      title: "Items Added to Cart",
      description: `${items.length} items have been added to your cart.`,
    });
    
    _setShowCartIntegration(true);
  };

  // Update grocery list and parse items
  const handleGroceryListChange = (value: string) => {
    setGroceryList(value);
    if (value.trim()) {
      const items = parseGroceryList(value);
      setParsedItems(items);
    } else {
      setParsedItems([]);
    }
  };

  // Handle textarea change with auto-resize
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Auto-resize textarea
    const textarea = e.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(200, textarea.scrollHeight) + 'px';
    
    // Update grocery list
    handleGroceryListChange(value);
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a PNG or JPG file only.';
    }

    // Check file size (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'File size must be less than 10MB.';
    }

    return null;
  };

  const processFile = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      return;
    }

    setUploadError('');
    setReceipt(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setReceiptPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleRemoveReceipt = () => {
    setReceipt(null);
    setReceiptPreview('');
    setUploadError('');
  };

  const [submitError, setSubmitError] = useState('');
  const [orderId, setOrderId] = useState('');

  const validateForm = () => {
    const errors = [];
    
    if (!selectedStore) {
      errors.push('Please select a store');
    }
    if (!customerInfo.name.trim()) {
      errors.push('Please enter your name');
    }
    if (!customerInfo.phone.trim()) {
      errors.push('Please enter your phone number');
    }
    if (!customerInfo.email.trim()) {
      errors.push('Please enter your email address');
    }
    if (!deliveryAddress || !deliveryAddress.trim()) {
      errors.push('Please enter a delivery address');
    }
    if (!deliveryTime.timeSlot) {
      errors.push('Please select a delivery time');
    }
    if (groceryList.trim().length === 0) {
      errors.push('Please add items to your grocery list');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (customerInfo.email && !emailRegex.test(customerInfo.email)) {
      errors.push('Please enter a valid email address');
    }
    
    // Phone validation (basic)
    const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
    if (customerInfo.phone && !phoneRegex.test(customerInfo.phone.replace(/\s/g, ''))) {
      errors.push('Please enter a valid phone number');
    }
    
    return errors;
  };

  const handleSubmitOrder = async () => {
    setSubmitError('');
    
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setSubmitError(validationErrors[0]); // Show first error
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Prepare order data
      const orderData = {
        type: 'grocery-delivery',
        storeId: selectedStore,
        customer: {
          name: customerInfo.name.trim(),
          phone: customerInfo.phone.trim(),
          email: customerInfo.email.trim()
        },
        delivery: {
          address: deliveryAddress,
          coordinates: selectedPlace ? {
            lat: selectedPlace.lat,
            lng: selectedPlace.lng
          } : null,
          timeSlot: deliveryTime.timeSlot,
          timeValue: deliveryTime.date
        },
        items: {
          groceryList: groceryList.trim(),
          itemCount: groceryList.trim().split('\n').filter(item => item.trim()).length,
          receipt: receipt ? {
            name: receipt.name,
            size: receipt.size,
            type: receipt.type
          } : null
        },
        specialInstructions: specialInstructions.trim(),
        serviceFee: 15.00,
        timestamp: new Date().toISOString()
      };

      // Make API call to submit order
      const response = await fetch('/api/orders/grocery-delivery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error occurred' }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();
      
      // Set order ID and mark as submitted
      setOrderId(result.orderId || `GD${Date.now().toString().slice(-6)}`);
      setOrderSubmitted(true);
      
    } catch (error) {
      console.error('Order submission error:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'Unable to place order. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
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
              <p className="font-mono text-lg font-semibold text-otw-gold">#{orderId}</p>
            </div>
            <p className="text-sm text-gray-400">
              You'll receive updates via SMS and email. Expected delivery: {deliveryTime.date && deliveryTime.timeSlot ? `${deliveryTime.date} ${deliveryTime.timeSlot}` : 'TBD'}
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
                  <div 
                    className={`dropzone-upload relative ${
                      isDragOver 
                        ? 'border-[var(--color-harvest-gold)] bg-[var(--color-harvest-gold)]/10 scale-105' 
                        : 'border-[var(--color-border)]'
                    } transition-all duration-300`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleReceiptUpload}
                      className="hidden"
                      id="receipt-upload"
                    />
                    <label htmlFor="receipt-upload" className="cursor-pointer text-center w-full h-full flex flex-col items-center justify-center">
                      <div className="p-4 bg-[var(--color-harvest-gold)]/10 rounded-full mb-3">
                        <Upload className="w-8 h-8 text-[var(--color-harvest-gold)]" />
                      </div>
                      <p className="text-[var(--color-onyx)] font-medium mb-1">
                        {isDragOver ? 'Drop your receipt here' : 'Drop your receipt here or click to browse'}
                      </p>
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
                        onClick={handleRemoveReceipt}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {uploadError && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-3">
                    <p className="text-red-400 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {uploadError}
                    </p>
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
                  onChange={handleTextareaChange}
                  rows={8}
                  className="textarea-otw min-h-[200px] transition-all duration-200"
                  style={{ resize: 'none' }}
                />
                <div className="absolute bottom-3 right-3 text-xs text-[var(--color-muted)] bg-[var(--color-surface)]/80 px-2 py-1 rounded">
                  {groceryList.split('\n').filter(line => line.trim()).length} items
                </div>
              </div>
              
              {/* Cart Integration Section */}
              {parsedItems.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Parsed Items ({parsedItems.length})</h4>
                    <Button
                      type="button"
                      onClick={addItemsToCart}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm"
                    >
                      Add All to Cart
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {parsedItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex-1">
                          <span className="font-medium">{item.name}</span>
                          <div className="text-sm text-gray-600">
                            Qty: {item.quantity} • ${item.price.toFixed(2)}
                          </div>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          ${(item.quantity * item.price).toFixed(2)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between items-center font-medium">
                    <span>Estimated Total:</span>
                    <span className="text-green-600">
                      ${parsedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
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
                label="Delivery Address"
                value={selectedAddress}
                onPlaceSelect={(place) => {
                  if (place && place.address) {
                    setSelectedPlace(place);
                    setSelectedAddress(place.address);
                    setDeliveryAddress(place.address);
                  } else {
                    setSelectedPlace(null);
                    setSelectedAddress('');
                    setDeliveryAddress('');
                  }
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
              <div>
                <label className="block text-[var(--color-onyx)] text-sm font-medium mb-2">Select Delivery Time *</label>
                <select
                  value={deliveryTime.timeSlot}
                  onChange={(e) => {
                    const selectedSlot = timeSlots.find(slot => slot.value === e.target.value);
                    setDeliveryTime({
                      date: selectedSlot ? selectedSlot.value : '',
                      timeSlot: selectedSlot ? selectedSlot.time : ''
                    });
                  }}
                  onBlur={(e) => {
                    // Validation on blur
                    if (!e.target.value) {
                      e.target.setCustomValidity('Please select a delivery time');
                    } else {
                      e.target.setCustomValidity('');
                    }
                  }}
                  className="input-otw"
                  required
                >
                  <option value="">Choose your delivery time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot.id} value={slot.value} disabled={!slot.available}>
                      {slot.time} {!slot.available && '(Unavailable)'}
                    </option>
                  ))}
                </select>
                {!deliveryTime.timeSlot && (
                  <p className="text-xs text-[var(--color-muted)] mt-2 italic">
                    Please select a delivery time to continue
                  </p>
                )}
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">Delivery Information:</p>
                    <ul className="text-xs space-y-1 text-blue-700 dark:text-blue-300">
                      <li>• Dynamic time slots based on store hours (8 AM - 10 PM)</li>
                      <li>• 30-minute delivery windows for precision</li>
                      <li>• ASAP option available during store hours</li>
                      <li>• We'll text you 30 minutes before arrival</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h2 className="text-[var(--color-harvest-gold)] text-sm font-semibold uppercase mb-4 tracking-wide flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Order Summary
              </h2>
              <div className="space-y-3">
                {/* Store */}
                <div className="flex justify-between items-start">
                  <span className="text-[var(--color-muted)] text-sm">Store:</span>
                  <span className={`font-medium text-right max-w-[60%] ${
                    selectedStore 
                      ? 'text-[var(--color-onyx)]' 
                      : 'text-[var(--color-muted)] italic'
                  }`}>
                    {selectedStore || 'Not selected'}
                  </span>
                </div>

                {/* Items Count */}
                <div className="flex justify-between items-start">
                  <span className="text-[var(--color-muted)] text-sm">Items:</span>
                  <span className={`font-medium ${
                    groceryList.trim() 
                      ? 'text-[var(--color-onyx)]' 
                      : 'text-[var(--color-muted)] italic'
                  }`}>
                    {groceryList.trim() 
                      ? `${groceryList.split('\n').filter(line => line.trim()).length} items` 
                      : 'Not selected'
                    }
                  </span>
                </div>

                {/* Receipt Status */}
                <div className="flex justify-between items-start">
                  <span className="text-[var(--color-muted)] text-sm">Receipt:</span>
                  <span className={`font-medium text-right ${
                    receiptPreview 
                      ? 'text-green-600' 
                      : 'text-[var(--color-muted)] italic'
                  }`}>
                    {receiptPreview ? '✓ Uploaded' : 'Not selected'}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="flex justify-between items-start">
                  <span className="text-[var(--color-muted)] text-sm">Customer:</span>
                  <span className={`font-medium text-right max-w-[60%] ${
                    customerInfo.name 
                      ? 'text-[var(--color-onyx)]' 
                      : 'text-[var(--color-muted)] italic'
                  }`}>
                    {customerInfo.name || 'Not selected'}
                  </span>
                </div>

                {/* Phone */}
                <div className="flex justify-between items-start">
                  <span className="text-[var(--color-muted)] text-sm">Phone:</span>
                  <span className={`font-medium text-right ${
                    customerInfo.phone 
                      ? 'text-[var(--color-onyx)]' 
                      : 'text-[var(--color-muted)] italic'
                  }`}>
                    {customerInfo.phone || 'Not selected'}
                  </span>
                </div>

                {/* Delivery Address */}
                <div className="flex justify-between items-start">
                  <span className="text-[var(--color-muted)] text-sm">Address:</span>
                  <span className={`font-medium text-right max-w-[60%] text-xs leading-relaxed ${
                    deliveryAddress 
                      ? 'text-[var(--color-onyx)]' 
                      : 'text-[var(--color-muted)] italic'
                  }`}>
                    {deliveryAddress 
                      ? deliveryAddress.length > 50 
                        ? `${deliveryAddress.substring(0, 50)}...` 
                        : deliveryAddress
                      : 'Not selected'
                    }
                  </span>
                </div>

                {/* Delivery Time */}
                <div className="flex justify-between items-start">
                  <span className="text-[var(--color-muted)] text-sm">Delivery:</span>
                  <span className={`font-medium text-right max-w-[60%] ${
                    deliveryTime.timeSlot 
                      ? 'text-[var(--color-onyx)]' 
                      : 'text-[var(--color-muted)] italic'
                  }`}>
                    {deliveryTime.timeSlot || 'Not selected'}
                  </span>
                </div>

                {/* Special Instructions */}
                {specialInstructions.trim() && (
                  <div className="flex justify-between items-start">
                    <span className="text-[var(--color-muted)] text-sm">Instructions:</span>
                    <span className="font-medium text-right max-w-[60%] text-xs text-[var(--color-onyx)]">
                      {specialInstructions.length > 40 
                        ? `${specialInstructions.substring(0, 40)}...` 
                        : specialInstructions
                      }
                    </span>
                  </div>
                )}

                <div className="border-t border-[var(--color-border)] pt-3 mt-4">
                  <div className="flex justify-between font-semibold">
                    <span className="text-[var(--color-onyx)]">Service Fee:</span>
                    <span className="text-[var(--color-harvest-gold)]">$15.00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {submitError && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Unable to Submit Order</h3>
                    <p className="text-sm text-red-700 dark:text-red-300">{submitError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmitOrder}
              disabled={isSubmitting || !selectedStore || !customerInfo.name || !customerInfo.phone || !deliveryAddress || !deliveryTime.timeSlot}
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

export default function GroceryDeliveryPage() {
  return (
    <ModernGoogleMapsProvider>
      <GroceryDeliveryPageContent />
    </ModernGoogleMapsProvider>
  );
}