'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Package, 
  MapPin, 
  Clock, 
  DollarSign, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Camera, 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle,
  Truck,
  Shield,
  Star,
  Calculator
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase-config';
import { toast } from '../ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

interface PackageDetails {
  weight: number;
  length: number;
  width: number;
  height: number;
  value: number;
  description: string;
  fragile: boolean;
  requiresSignature: boolean;
  insurance: boolean;
}

interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  timeRange: string;
  basePrice: number;
  icon: React.ReactNode;
  features: string[];
}

interface RecipientInfo {
  name: string;
  phone: string;
  email: string;
  instructions: string;
}

const deliveryOptions: DeliveryOption[] = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    description: 'Reliable and affordable',
    timeRange: '3-5 business days',
    basePrice: 8.99,
    icon: <Package className="w-5 h-5" />,
    features: ['Tracking included', 'Delivery confirmation']
  },
  {
    id: 'express',
    name: 'Express Delivery',
    description: 'Fast and secure',
    timeRange: '1-2 business days',
    basePrice: 15.99,
    icon: <Truck className="w-5 h-5" />,
    features: ['Priority handling', 'SMS updates', 'Signature required']
  },
  {
    id: 'overnight',
    name: 'Overnight Delivery',
    description: 'Next business day',
    timeRange: 'Next business day',
    basePrice: 29.99,
    icon: <Clock className="w-5 h-5" />,
    features: ['Guaranteed delivery', 'Real-time tracking', 'Insurance included']
  },
  {
    id: 'sameday',
    name: 'Same Day Delivery',
    description: 'Urgent delivery',
    timeRange: '2-6 hours',
    basePrice: 49.99,
    icon: <Star className="w-5 h-5" />,
    features: ['Live tracking', 'Direct contact with driver', 'Photo confirmation']
  }
];

const packageTypes = [
  { id: 'envelope', name: 'Envelope/Document', maxWeight: 1, dimensions: '9x12x1' },
  { id: 'small', name: 'Small Package', maxWeight: 5, dimensions: '12x9x6' },
  { id: 'medium', name: 'Medium Package', maxWeight: 20, dimensions: '18x14x8' },
  { id: 'large', name: 'Large Package', maxWeight: 50, dimensions: '24x18x12' },
  { id: 'custom', name: 'Custom Size', maxWeight: 150, dimensions: 'Custom' }
];

export default function EnhancedPackageDeliveryForm() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form state
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState('standard');
  const [packageType, setPackageType] = useState('small');
  const [packageDetails, setPackageDetails] = useState<PackageDetails>({
    weight: 1,
    length: 12,
    width: 9,
    height: 6,
    value: 50,
    description: '',
    fragile: false,
    requiresSignature: false,
    insurance: false
  });
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo>({
    name: '',
    phone: '',
    email: '',
    instructions: ''
  });
  const [scheduledPickup, setScheduledPickup] = useState('');
  const [preferredDelivery, setPreferredDelivery] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [estimatedCost, setEstimatedCost] = useState(0);

  // Fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const addressQuery = query(
          collection(db, 'addresses'),
          where('userId', '==', user.uid)
        );
        const addressSnapshot = await getDocs(addressQuery);
        const addressList = addressSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Address[];
        setAddresses(addressList);
        
        // Set default pickup address
        const defaultAddress = addressList.find(addr => addr.isDefault);
        if (defaultAddress) {
          setPickupAddress(defaultAddress.id);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        toast({
          title: 'Error',
          description: 'Failed to load addresses',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [user]);

  // Calculate estimated cost
  useEffect(() => {
    const calculateCost = () => {
      const selectedOption = deliveryOptions.find(opt => opt.id === selectedDelivery);
      if (!selectedOption) return;

      let cost = selectedOption.basePrice;
      
      // Weight-based pricing
      if (packageDetails.weight > 5) {
        cost += (packageDetails.weight - 5) * 2;
      }
      
      // Size-based pricing
      const volume = packageDetails.length * packageDetails.width * packageDetails.height;
      if (volume > 1000) {
        cost += Math.floor(volume / 1000) * 3;
      }
      
      // Insurance
      if (packageDetails.insurance) {
        cost += Math.max(5, packageDetails.value * 0.02);
      }
      
      // Signature requirement
      if (packageDetails.requiresSignature) {
        cost += 3;
      }
      
      // Fragile handling
      if (packageDetails.fragile) {
        cost += 5;
      }

      setEstimatedCost(cost);
    };

    calculateCost();
  }, [selectedDelivery, packageDetails]);

  // Handle package type change
  const handlePackageTypeChange = (type: string) => {
    setPackageType(type);
    const selectedType = packageTypes.find(t => t.id === type);
    if (selectedType && type !== 'custom') {
      const [length, width, height] = selectedType.dimensions.split('x').map(Number);
      setPackageDetails(prev => ({
        ...prev,
        length: length || prev.length,
        width: width || prev.width,
        height: height || prev.height,
        weight: Math.min(prev.weight, selectedType.maxWeight)
      }));
    }
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setUploadedImages(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Remove uploaded image
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return pickupAddress !== '' && deliveryAddress !== '';
      case 2:
        return packageDetails.weight > 0 && packageDetails.description.trim() !== '';
      case 3:
        return recipientInfo.name.trim() !== '' && recipientInfo.phone.trim() !== '';
      default:
        return true;
    }
  };

  // Handle form submission
  const handleSubmitOrder = async () => {
    if (!user?.uid) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to place an order',
        variant: 'destructive'
      });
      return;
    }

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      toast({
        title: 'Incomplete Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        userId: user.uid,
        type: 'package',
        pickupAddress,
        deliveryAddress,
        deliveryOption: selectedDelivery,
        packageDetails,
        recipientInfo,
        scheduledPickup: scheduledPickup || null,
        preferredDelivery: preferredDelivery || null,
        specialInstructions,
        uploadedImages,
        pricing: {
          basePrice: deliveryOptions.find(opt => opt.id === selectedDelivery)?.basePrice || 0,
          additionalFees: estimatedCost - (deliveryOptions.find(opt => opt.id === selectedDelivery)?.basePrice || 0),
          total: estimatedCost
        },
        status: 'pending',
        createdAt: new Date().toISOString(),
        estimatedPickup: scheduledPickup || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Reset form
      setCurrentStep(1);
      setPackageDetails({
        weight: 1,
        length: 12,
        width: 9,
        height: 6,
        value: 50,
        description: '',
        fragile: false,
        requiresSignature: false,
        insurance: false
      });
      setRecipientInfo({
        name: '',
        phone: '',
        email: '',
        instructions: ''
      });
      setScheduledPickup('');
      setPreferredDelivery('');
      setSpecialInstructions('');
      setUploadedImages([]);

      toast({
        title: 'Package Delivery Scheduled!',
        description: `Your delivery order #${docRef.id.slice(-6)} has been created. You'll receive pickup confirmation soon.`
      });

    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule delivery. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-otw-gold"></div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'Addresses', description: 'Pickup and delivery locations' },
    { number: 2, title: 'Package Details', description: 'Size, weight, and contents' },
    { number: 3, title: 'Recipient Info', description: 'Contact and delivery preferences' },
    { number: 4, title: 'Review & Pay', description: 'Confirm order and payment' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="bg-gray-800/50 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="w-6 h-6" />
              Package Delivery Service
            </CardTitle>
            <CardDescription className="text-gray-400">
              Secure and reliable package delivery with real-time tracking
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                    currentStep >= step.number
                      ? 'bg-otw-gold text-black'
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-white' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-otw-gold' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Addresses */}
            {currentStep === 1 && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Pickup & Delivery Addresses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pickup Address */}
                    <div className="space-y-3">
                      <Label className="text-white font-medium">Pickup Address</Label>
                      {addresses.length > 0 ? (
                        <Select value={pickupAddress} onValueChange={setPickupAddress}>
                          <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                            <SelectValue placeholder="Select pickup address" />
                          </SelectTrigger>
                          <SelectContent>
                            {addresses.map((address) => (
                              <SelectItem key={address.id} value={address.id}>
                                <div>
                                  <div className="font-medium">{address.name}</div>
                                  <div className="text-sm text-gray-400">
                                    {address.street}, {address.city}, {address.state} {address.zip}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                          <p className="text-gray-400 text-sm mb-2">No saved addresses found</p>
                          <Button size="sm" variant="outline">
                            Add Address
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Delivery Address */}
                    <div className="space-y-3">
                      <Label className="text-white font-medium">Delivery Address</Label>
                      <div className="space-y-3">
                        {addresses.length > 0 && (
                          <Select value={deliveryAddress} onValueChange={setDeliveryAddress}>
                            <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                              <SelectValue placeholder="Select delivery address" />
                            </SelectTrigger>
                            <SelectContent>
                              {addresses.map((address) => (
                                <SelectItem key={address.id} value={address.id}>
                                  <div>
                                    <div className="font-medium">{address.name}</div>
                                    <div className="text-sm text-gray-400">
                                      {address.street}, {address.city}, {address.state} {address.zip}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        <div className="text-center text-gray-400 text-sm">or</div>
                        <Input
                          placeholder="Enter new delivery address"
                          className="bg-gray-700/50 border-gray-600 text-white"
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Scheduling */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white font-medium">Preferred Pickup Time</Label>
                      <Input
                        type="datetime-local"
                        value={scheduledPickup}
                        onChange={(e) => setScheduledPickup(e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white font-medium">Preferred Delivery Time</Label>
                      <Input
                        type="datetime-local"
                        value={preferredDelivery}
                        onChange={(e) => setPreferredDelivery(e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Package Details */}
            {currentStep === 2 && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Package Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Package Type */}
                  <div className="space-y-3">
                    <Label className="text-white font-medium">Package Type</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {packageTypes.map((type) => (
                        <div
                          key={type.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            packageType === type.id
                              ? 'border-otw-gold bg-otw-gold/10'
                              : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                          }`}
                          onClick={() => handlePackageTypeChange(type.id)}
                        >
                          <h4 className="text-white font-medium text-sm">{type.name}</h4>
                          <p className="text-gray-400 text-xs mt-1">Max {type.maxWeight}lbs</p>
                          <p className="text-gray-400 text-xs">{type.dimensions}"</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dimensions and Weight */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white text-sm">Length (in)</Label>
                      <Input
                        type="number"
                        value={packageDetails.length}
                        onChange={(e) => setPackageDetails(prev => ({ ...prev, length: Number(e.target.value) }))}
                        className="bg-gray-700/50 border-gray-600 text-white"
                        min="1"
                        disabled={packageType !== 'custom'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white text-sm">Width (in)</Label>
                      <Input
                        type="number"
                        value={packageDetails.width}
                        onChange={(e) => setPackageDetails(prev => ({ ...prev, width: Number(e.target.value) }))}
                        className="bg-gray-700/50 border-gray-600 text-white"
                        min="1"
                        disabled={packageType !== 'custom'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white text-sm">Height (in)</Label>
                      <Input
                        type="number"
                        value={packageDetails.height}
                        onChange={(e) => setPackageDetails(prev => ({ ...prev, height: Number(e.target.value) }))}
                        className="bg-gray-700/50 border-gray-600 text-white"
                        min="1"
                        disabled={packageType !== 'custom'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white text-sm">Weight (lbs)</Label>
                      <Input
                        type="number"
                        value={packageDetails.weight}
                        onChange={(e) => setPackageDetails(prev => ({ ...prev, weight: Number(e.target.value) }))}
                        className="bg-gray-700/50 border-gray-600 text-white"
                        min="0.1"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {/* Package Description */}
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Package Contents *</Label>
                    <Textarea
                      placeholder="Describe what's in the package (required for shipping)"
                      value={packageDetails.description}
                      onChange={(e) => setPackageDetails(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-gray-700/50 border-gray-600 text-white"
                      rows={3}
                    />
                  </div>

                  {/* Package Value */}
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Declared Value ($)</Label>
                    <Input
                      type="number"
                      value={packageDetails.value}
                      onChange={(e) => setPackageDetails(prev => ({ ...prev, value: Number(e.target.value) }))}
                      className="bg-gray-700/50 border-gray-600 text-white"
                      min="1"
                      placeholder="Package value for insurance purposes"
                    />
                  </div>

                  {/* Special Handling */}
                  <div className="space-y-4">
                    <Label className="text-white font-medium">Special Handling</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="fragile"
                          checked={packageDetails.fragile}
                          onCheckedChange={(checked) => setPackageDetails(prev => ({ ...prev, fragile: !!checked }))}
                        />
                        <Label htmlFor="fragile" className="text-white text-sm flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Fragile - Handle with care (+$5.00)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="signature"
                          checked={packageDetails.requiresSignature}
                          onCheckedChange={(checked) => setPackageDetails(prev => ({ ...prev, requiresSignature: !!checked }))}
                        />
                        <Label htmlFor="signature" className="text-white text-sm flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Signature required (+$3.00)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="insurance"
                          checked={packageDetails.insurance}
                          onCheckedChange={(checked) => setPackageDetails(prev => ({ ...prev, insurance: !!checked }))}
                        />
                        <Label htmlFor="insurance" className="text-white text-sm flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Insurance coverage (+${Math.max(5, packageDetails.value * 0.02).toFixed(2)})
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div className="space-y-3">
                    <Label className="text-white font-medium">Package Photos (Optional)</Label>
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Click to upload package photos</p>
                        <p className="text-gray-500 text-xs mt-1">Helps with identification and handling</p>
                      </label>
                    </div>
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Package photo ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-1 right-1 w-6 h-6 p-0"
                              onClick={() => removeImage(index)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Recipient Info */}
            {currentStep === 3 && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Recipient Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white font-medium">Recipient Name *</Label>
                      <Input
                        value={recipientInfo.name}
                        onChange={(e) => setRecipientInfo(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-gray-700/50 border-gray-600 text-white"
                        placeholder="Full name of recipient"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white font-medium">Phone Number *</Label>
                      <Input
                        value={recipientInfo.phone}
                        onChange={(e) => setRecipientInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="bg-gray-700/50 border-gray-600 text-white"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Email Address (Optional)</Label>
                    <Input
                      type="email"
                      value={recipientInfo.email}
                      onChange={(e) => setRecipientInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-gray-700/50 border-gray-600 text-white"
                      placeholder="recipient@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white font-medium">Delivery Instructions</Label>
                    <Textarea
                      value={recipientInfo.instructions}
                      onChange={(e) => setRecipientInfo(prev => ({ ...prev, instructions: e.target.value }))}
                      className="bg-gray-700/50 border-gray-600 text-white"
                      placeholder="Special delivery instructions, access codes, etc."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white font-medium">Additional Notes</Label>
                    <Textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="bg-gray-700/50 border-gray-600 text-white"
                      placeholder="Any other special instructions or requirements"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Review & Pay */}
            {currentStep === 4 && (
              <div className="space-y-6">
                {/* Delivery Options */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      Choose Delivery Speed
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {deliveryOptions.map((option) => (
                      <div
                        key={option.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedDelivery === option.id
                            ? 'border-otw-gold bg-otw-gold/10'
                            : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                        }`}
                        onClick={() => setSelectedDelivery(option.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="text-otw-gold">{option.icon}</div>
                            <div>
                              <h4 className="text-white font-medium">{option.name}</h4>
                              <p className="text-gray-400 text-sm">{option.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-otw-gold font-bold">${option.basePrice.toFixed(2)}</div>
                            <div className="text-gray-400 text-sm">{option.timeRange}</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {option.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Order Summary */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Base delivery fee</span>
                        <span className="text-white">${deliveryOptions.find(opt => opt.id === selectedDelivery)?.basePrice.toFixed(2)}</span>
                      </div>
                      {packageDetails.weight > 5 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Weight surcharge ({packageDetails.weight}lbs)</span>
                          <span className="text-white">${((packageDetails.weight - 5) * 2).toFixed(2)}</span>
                        </div>
                      )}
                      {packageDetails.fragile && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Fragile handling</span>
                          <span className="text-white">$5.00</span>
                        </div>
                      )}
                      {packageDetails.requiresSignature && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Signature required</span>
                          <span className="text-white">$3.00</span>
                        </div>
                      )}
                      {packageDetails.insurance && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Insurance coverage</span>
                          <span className="text-white">${Math.max(5, packageDetails.value * 0.02).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-600 pt-3">
                        <div className="flex justify-between text-lg font-bold">
                          <span className="text-white">Total</span>
                          <span className="text-otw-gold">${estimatedCost.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="border-gray-600 text-white hover:bg-gray-700"
          >
            Previous
          </Button>
          
          {currentStep < 4 ? (
            <Button
              onClick={() => {
                if (validateStep(currentStep)) {
                  setCurrentStep(prev => prev + 1);
                } else {
                  toast({
                    title: 'Incomplete Information',
                    description: 'Please fill in all required fields before continuing',
                    variant: 'destructive'
                  });
                }
              }}
              className="bg-otw-gold text-black hover:bg-otw-gold/90"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmitOrder}
              disabled={submitting}
              className="bg-otw-gold text-black hover:bg-otw-gold/90"
            >
              {submitting ? 'Processing...' : `Schedule Delivery - $${estimatedCost.toFixed(2)}`}
            </Button>
          )}
        </div>

        {!user && (
          <Alert className="border-yellow-500/50 bg-yellow-500/10 mt-6">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-300">
              Please sign in to schedule a package delivery
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}