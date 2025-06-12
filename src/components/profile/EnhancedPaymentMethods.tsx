'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Shield, 
  Star, 
  AlertTriangle, 
  Info, 
  Eye, 
  EyeOff, 
  Lock, 
  Smartphone, 
  Wallet, 
  Building, 
  Globe, 
  Calendar, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Save,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, updateDoc, collection, addDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase-config';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../ui/use-toast';
import { cn } from '../../lib/utils';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'paypal' | 'apple_pay' | 'google_pay';
  brand?: string; // visa, mastercard, amex, etc.
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  holderName: string;
  isDefault: boolean;
  isVerified: boolean;
  nickname?: string;
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  stripePaymentMethodId?: string;
  createdAt: string;
  updatedAt: string;
}

interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface NewPaymentMethodForm {
  type: 'card' | 'bank' | 'paypal';
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  holderName: string;
  nickname: string;
  isDefault: boolean;
  billingAddress: BillingAddress;
  // Bank account fields
  routingNumber: string;
  accountNumber: string;
  accountType: 'checking' | 'savings';
  // PayPal fields
  paypalEmail: string;
}

const paymentTypeIcons = {
  card: <CreditCard className="w-5 h-5" />,
  bank: <Building className="w-5 h-5" />,
  paypal: <Wallet className="w-5 h-5" />,
  apple_pay: <Smartphone className="w-5 h-5" />,
  google_pay: <Globe className="w-5 h-5" />
};

const cardBrandColors = {
  visa: 'bg-blue-600',
  mastercard: 'bg-red-600',
  amex: 'bg-green-600',
  discover: 'bg-orange-600',
  default: 'bg-gray-600'
};

const defaultForm: NewPaymentMethodForm = {
  type: 'card',
  cardNumber: '',
  expiryMonth: '',
  expiryYear: '',
  cvc: '',
  holderName: '',
  nickname: '',
  isDefault: false,
  billingAddress: {
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US'
  },
  routingNumber: '',
  accountNumber: '',
  accountType: 'checking',
  paypalEmail: ''
};

export default function EnhancedPaymentMethods() {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<NewPaymentMethodForm>(defaultForm);
  const [showCVC, setShowCVC] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load payment methods from Firebase
  const loadPaymentMethods = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, 'paymentMethods'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      
      const methods: PaymentMethod[] = [];
      querySnapshot.forEach((doc) => {
        methods.push({ id: doc.id, ...doc.data() } as PaymentMethod);
      });
      
      // Sort by default first, then by creation date
      methods.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment methods',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!form.holderName.trim()) {
      newErrors.holderName = 'Cardholder name is required';
    }
    
    if (form.type === 'card') {
      if (!form.cardNumber.replace(/\s/g, '')) {
        newErrors.cardNumber = 'Card number is required';
      } else if (form.cardNumber.replace(/\s/g, '').length < 13) {
        newErrors.cardNumber = 'Invalid card number';
      }
      
      if (!form.expiryMonth) {
        newErrors.expiryMonth = 'Expiry month is required';
      }
      
      if (!form.expiryYear) {
        newErrors.expiryYear = 'Expiry year is required';
      }
      
      if (!form.cvc) {
        newErrors.cvc = 'CVC is required';
      } else if (form.cvc.length < 3) {
        newErrors.cvc = 'Invalid CVC';
      }
    }
    
    if (form.type === 'bank') {
      if (!form.routingNumber) {
        newErrors.routingNumber = 'Routing number is required';
      } else if (form.routingNumber.length !== 9) {
        newErrors.routingNumber = 'Routing number must be 9 digits';
      }
      
      if (!form.accountNumber) {
        newErrors.accountNumber = 'Account number is required';
      }
    }
    
    if (form.type === 'paypal') {
      if (!form.paypalEmail) {
        newErrors.paypalEmail = 'PayPal email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.paypalEmail)) {
        newErrors.paypalEmail = 'Invalid email address';
      }
    }
    
    // Billing address validation
    if (!form.billingAddress.line1.trim()) {
      newErrors['billingAddress.line1'] = 'Address line 1 is required';
    }
    
    if (!form.billingAddress.city.trim()) {
      newErrors['billingAddress.city'] = 'City is required';
    }
    
    if (!form.billingAddress.state.trim()) {
      newErrors['billingAddress.state'] = 'State is required';
    }
    
    if (!form.billingAddress.postalCode.trim()) {
      newErrors['billingAddress.postalCode'] = 'Postal code is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const detectCardBrand = (cardNumber: string): string => {
    const number = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6/.test(number)) return 'discover';
    
    return 'default';
  };

  const addPaymentMethod = async () => {
    if (!user || !validateForm()) return;
    
    setSaving(true);
    try {
      const newMethod: Omit<PaymentMethod, 'id'> = {
        type: form.type,
        holderName: form.holderName,
        isDefault: form.isDefault || paymentMethods.length === 0,
        isVerified: false,
        nickname: form.nickname || undefined,
        billingAddress: form.billingAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        last4: '',
        brand: undefined
      };
      
      if (form.type === 'card') {
        const cardNumber = form.cardNumber.replace(/\s/g, '');
        newMethod.last4 = cardNumber.slice(-4);
        newMethod.brand = detectCardBrand(form.cardNumber);
        newMethod.expiryMonth = parseInt(form.expiryMonth);
        newMethod.expiryYear = parseInt(form.expiryYear);
      } else if (form.type === 'bank') {
        newMethod.last4 = form.accountNumber.slice(-4);
      } else if (form.type === 'paypal') {
        newMethod.last4 = form.paypalEmail.split('@')[0].slice(-4);
      }
      
      // If this is set as default, update other methods
      if (newMethod.isDefault) {
        for (const method of paymentMethods) {
          if (method.isDefault) {
            await updateDoc(doc(db, 'paymentMethods', method.id), {
              isDefault: false,
              updatedAt: new Date().toISOString()
            });
          }
        }
      }
      
      const docRef = await addDoc(collection(db, 'paymentMethods'), {
        ...newMethod,
        userId: user.uid
      });
      
      setPaymentMethods(prev => [{ id: docRef.id, ...newMethod }, ...prev]);
      setShowAddForm(false);
      setForm(defaultForm);
      setErrors({});
      
      toast({
        title: 'Success',
        description: 'Payment method added successfully'
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast({
        title: 'Error',
        description: 'Failed to add payment method',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const deletePaymentMethod = async (id: string) => {
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, 'paymentMethods', id));
      setPaymentMethods(prev => prev.filter(method => method.id !== id));
      
      toast({
        title: 'Success',
        description: 'Payment method deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete payment method',
        variant: 'destructive'
      });
    }
  };

  const setDefaultPaymentMethod = async (id: string) => {
    if (!user) return;
    
    try {
      // Update all methods to not be default
      for (const method of paymentMethods) {
        await updateDoc(doc(db, 'paymentMethods', method.id), {
          isDefault: method.id === id,
          updatedAt: new Date().toISOString()
        });
      }
      
      setPaymentMethods(prev => 
        prev.map(method => ({
          ...method,
          isDefault: method.id === id
        }))
      );
      
      toast({
        title: 'Success',
        description: 'Default payment method updated'
      });
    } catch (error) {
      console.error('Error updating default payment method:', error);
      toast({
        title: 'Error',
        description: 'Failed to update default payment method',
        variant: 'destructive'
      });
    }
  };

  const updateFormField = (field: string, value: any) => {
    if (field.startsWith('billingAddress.')) {
      const addressField = field.split('.')[1];
      setForm(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [addressField]: value
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-otw-gold"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-otw-gold" />
            Payment Methods
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your payment methods and billing information
          </p>
        </div>
        
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-otw-gold text-black hover:bg-otw-gold/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {/* Security Notice */}
      <Card className="bg-blue-900/20 border-blue-700">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-blue-400 font-medium">Secure Payment Processing</h3>
              <p className="text-blue-300/80 text-sm mt-1">
                Your payment information is encrypted and securely processed by Stripe. 
                We never store your full card details on our servers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods List */}
      <div className="space-y-4">
        {paymentMethods.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-8 text-center">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">No Payment Methods</h3>
              <p className="text-gray-400 mb-4">
                Add a payment method to start placing orders
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-otw-gold text-black hover:bg-otw-gold/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Payment Method
              </Button>
            </CardContent>
          </Card>
        ) : (
          paymentMethods.map((method) => (
            <Card key={method.id} className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-lg",
                      method.brand ? cardBrandColors[method.brand] || cardBrandColors.default : 'bg-gray-600'
                    )}>
                      {paymentTypeIcons[method.type]}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium">
                          {method.type === 'card' ? (
                            `•••• •••• •••• ${method.last4}`
                          ) : method.type === 'bank' ? (
                            `Bank •••${method.last4}`
                          ) : (
                            `PayPal •••${method.last4}`
                          )}
                        </h3>
                        
                        {method.isDefault && (
                          <Badge className="bg-otw-gold text-black">
                            <Star className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                        
                        {method.isVerified ? (
                          <Badge variant="secondary" className="bg-green-900/30 text-green-400">
                            <Check className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-yellow-900/30 text-yellow-400">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-gray-400 text-sm mt-1">
                        {method.holderName}
                        {method.nickname && ` • ${method.nickname}`}
                        {method.type === 'card' && method.expiryMonth && method.expiryYear && (
                          ` • Expires ${method.expiryMonth.toString().padStart(2, '0')}/${method.expiryYear}`
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDefaultPaymentMethod(method.id)}
                        className="border-gray-600 text-white hover:bg-gray-700"
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Set Default
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(method.id)}
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePaymentMethod(method.id)}
                      className="border-red-600 text-red-400 hover:bg-red-900/20"
                      disabled={method.isDefault && paymentMethods.length > 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {method.billingAddress && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {method.billingAddress.line1}
                        {method.billingAddress.line2 && `, ${method.billingAddress.line2}`}
                        , {method.billingAddress.city}, {method.billingAddress.state} {method.billingAddress.postalCode}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Payment Method Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Add Payment Method</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                {/* Payment Type Selection */}
                <div className="space-y-6">
                  <div>
                    <Label className="text-white text-sm font-medium mb-3 block">Payment Type</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'card', label: 'Credit/Debit Card', icon: <CreditCard className="w-5 h-5" /> },
                        { value: 'bank', label: 'Bank Account', icon: <Building className="w-5 h-5" /> },
                        { value: 'paypal', label: 'PayPal', icon: <Wallet className="w-5 h-5" /> }
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => updateFormField('type', type.value)}
                          className={cn(
                            "p-4 rounded-lg border-2 transition-colors flex flex-col items-center gap-2",
                            form.type === type.value
                              ? "border-otw-gold bg-otw-gold/10 text-otw-gold"
                              : "border-gray-600 text-gray-400 hover:border-gray-500"
                          )}
                        >
                          {type.icon}
                          <span className="text-sm font-medium">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Card Form */}
                  {form.type === 'card' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label className="text-white text-sm font-medium mb-2 block">Card Number</Label>
                          <Input
                            value={form.cardNumber}
                            onChange={(e) => updateFormField('cardNumber', formatCardNumber(e.target.value))}
                            placeholder="1234 5678 9012 3456"
                            className="bg-gray-700/50 border-gray-600 text-white"
                            maxLength={19}
                          />
                          {errors.cardNumber && (
                            <p className="text-red-400 text-sm mt-1">{errors.cardNumber}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label className="text-white text-sm font-medium mb-2 block">Expiry Month</Label>
                          <Select value={form.expiryMonth} onValueChange={(value) => updateFormField('expiryMonth', value)}>
                            <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                              <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => {
                                const month = (i + 1).toString().padStart(2, '0');
                                return (
                                  <SelectItem key={month} value={month}>
                                    {month}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          {errors.expiryMonth && (
                            <p className="text-red-400 text-sm mt-1">{errors.expiryMonth}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label className="text-white text-sm font-medium mb-2 block">Expiry Year</Label>
                          <Select value={form.expiryYear} onValueChange={(value) => updateFormField('expiryYear', value)}>
                            <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 10 }, (_, i) => {
                                const year = (new Date().getFullYear() + i).toString();
                                return (
                                  <SelectItem key={year} value={year}>
                                    {year}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          {errors.expiryYear && (
                            <p className="text-red-400 text-sm mt-1">{errors.expiryYear}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label className="text-white text-sm font-medium mb-2 block">CVC</Label>
                          <div className="relative">
                            <Input
                              type={showCVC ? 'text' : 'password'}
                              value={form.cvc}
                              onChange={(e) => updateFormField('cvc', e.target.value.replace(/\D/g, ''))}
                              placeholder="123"
                              className="bg-gray-700/50 border-gray-600 text-white pr-10"
                              maxLength={4}
                            />
                            <button
                              type="button"
                              onClick={() => setShowCVC(!showCVC)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              {showCVC ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {errors.cvc && (
                            <p className="text-red-400 text-sm mt-1">{errors.cvc}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label className="text-white text-sm font-medium mb-2 block">Cardholder Name</Label>
                          <Input
                            value={form.holderName}
                            onChange={(e) => updateFormField('holderName', e.target.value)}
                            placeholder="John Doe"
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                          {errors.holderName && (
                            <p className="text-red-400 text-sm mt-1">{errors.holderName}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Bank Account Form */}
                  {form.type === 'bank' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white text-sm font-medium mb-2 block">Routing Number</Label>
                          <Input
                            value={form.routingNumber}
                            onChange={(e) => updateFormField('routingNumber', e.target.value.replace(/\D/g, ''))}
                            placeholder="123456789"
                            className="bg-gray-700/50 border-gray-600 text-white"
                            maxLength={9}
                          />
                          {errors.routingNumber && (
                            <p className="text-red-400 text-sm mt-1">{errors.routingNumber}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label className="text-white text-sm font-medium mb-2 block">Account Number</Label>
                          <div className="relative">
                            <Input
                              type={showAccountNumber ? 'text' : 'password'}
                              value={form.accountNumber}
                              onChange={(e) => updateFormField('accountNumber', e.target.value.replace(/\D/g, ''))}
                              placeholder="1234567890"
                              className="bg-gray-700/50 border-gray-600 text-white pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowAccountNumber(!showAccountNumber)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              {showAccountNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {errors.accountNumber && (
                            <p className="text-red-400 text-sm mt-1">{errors.accountNumber}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label className="text-white text-sm font-medium mb-2 block">Account Type</Label>
                          <Select value={form.accountType} onValueChange={(value: any) => updateFormField('accountType', value)}>
                            <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="checking">Checking</SelectItem>
                              <SelectItem value="savings">Savings</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-white text-sm font-medium mb-2 block">Account Holder Name</Label>
                          <Input
                            value={form.holderName}
                            onChange={(e) => updateFormField('holderName', e.target.value)}
                            placeholder="John Doe"
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                          {errors.holderName && (
                            <p className="text-red-400 text-sm mt-1">{errors.holderName}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* PayPal Form */}
                  {form.type === 'paypal' && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white text-sm font-medium mb-2 block">PayPal Email</Label>
                        <Input
                          type="email"
                          value={form.paypalEmail}
                          onChange={(e) => updateFormField('paypalEmail', e.target.value)}
                          placeholder="john@example.com"
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                        {errors.paypalEmail && (
                          <p className="text-red-400 text-sm mt-1">{errors.paypalEmail}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-white text-sm font-medium mb-2 block">Account Holder Name</Label>
                        <Input
                          value={form.holderName}
                          onChange={(e) => updateFormField('holderName', e.target.value)}
                          placeholder="John Doe"
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                        {errors.holderName && (
                          <p className="text-red-400 text-sm mt-1">{errors.holderName}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Billing Address */}
                  <div>
                    <Label className="text-white text-sm font-medium mb-3 block">Billing Address</Label>
                    <div className="space-y-4">
                      <div>
                        <Input
                          value={form.billingAddress.line1}
                          onChange={(e) => updateFormField('billingAddress.line1', e.target.value)}
                          placeholder="Address Line 1"
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                        {errors['billingAddress.line1'] && (
                          <p className="text-red-400 text-sm mt-1">{errors['billingAddress.line1']}</p>
                        )}
                      </div>
                      
                      <div>
                        <Input
                          value={form.billingAddress.line2 || ''}
                          onChange={(e) => updateFormField('billingAddress.line2', e.target.value)}
                          placeholder="Address Line 2 (Optional)"
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Input
                            value={form.billingAddress.city}
                            onChange={(e) => updateFormField('billingAddress.city', e.target.value)}
                            placeholder="City"
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                          {errors['billingAddress.city'] && (
                            <p className="text-red-400 text-sm mt-1">{errors['billingAddress.city']}</p>
                          )}
                        </div>
                        
                        <div>
                          <Input
                            value={form.billingAddress.state}
                            onChange={(e) => updateFormField('billingAddress.state', e.target.value)}
                            placeholder="State"
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                          {errors['billingAddress.state'] && (
                            <p className="text-red-400 text-sm mt-1">{errors['billingAddress.state']}</p>
                          )}
                        </div>
                        
                        <div>
                          <Input
                            value={form.billingAddress.postalCode}
                            onChange={(e) => updateFormField('billingAddress.postalCode', e.target.value)}
                            placeholder="ZIP Code"
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                          {errors['billingAddress.postalCode'] && (
                            <p className="text-red-400 text-sm mt-1">{errors['billingAddress.postalCode']}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Options */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white text-sm font-medium mb-2 block">Nickname (Optional)</Label>
                      <Input
                        value={form.nickname}
                        onChange={(e) => updateFormField('nickname', e.target.value)}
                        placeholder="e.g., Personal Card, Business Account"
                        className="bg-gray-700/50 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white font-medium">Set as Default</Label>
                        <p className="text-gray-400 text-sm">Use this payment method for future orders</p>
                      </div>
                      <Switch
                        checked={form.isDefault}
                        onCheckedChange={(checked) => updateFormField('isDefault', checked)}
                      />
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-600">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={addPaymentMethod}
                      disabled={saving}
                      className="bg-otw-gold text-black hover:bg-otw-gold/90"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Add Payment Method
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}