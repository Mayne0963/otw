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
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Clock, 
  MapPin, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  Search,
  Star,
  Truck,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase-config';
import { toast } from '../ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  image?: string;
  inStock: boolean;
  description?: string;
  brand?: string;
  rating?: number;
}

interface CartItem extends GroceryItem {
  quantity: number;
  specialInstructions?: string;
}

interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  timeRange: string;
  price: number;
  icon: React.ReactNode;
}

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

const deliveryOptions: DeliveryOption[] = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    description: 'Next business day',
    timeRange: '1-2 business days',
    price: 4.99,
    icon: <Truck className="w-5 h-5" />
  },
  {
    id: 'express',
    name: 'Express Delivery',
    description: 'Same day delivery',
    timeRange: '2-4 hours',
    price: 9.99,
    icon: <Clock className="w-5 h-5" />
  },
  {
    id: 'priority',
    name: 'Priority Delivery',
    description: 'Rush delivery',
    timeRange: '30-60 minutes',
    price: 19.99,
    icon: <Star className="w-5 h-5" />
  }
];

const groceryCategories = [
  'All',
  'Fresh Produce',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Pantry Staples',
  'Frozen Foods',
  'Beverages',
  'Snacks',
  'Health & Beauty',
  'Household Items'
];

export default function EnhancedGroceryOrderForm() {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDelivery, setSelectedDelivery] = useState('standard');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [tipAmount, setTipAmount] = useState(0);
  const [customTip, setCustomTip] = useState('');
  const [contactlessDelivery, setContactlessDelivery] = useState(false);
  const [leaveAtDoor, setLeaveAtDoor] = useState(false);

  // Fetch grocery items and user addresses
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch grocery items
        const groceryQuery = query(collection(db, 'groceryItems'));
        const grocerySnapshot = await getDocs(groceryQuery);
        const groceryList = grocerySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as GroceryItem[];
        setGroceryItems(groceryList);

        // Fetch user addresses if logged in
        if (user?.uid) {
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
          
          // Set default address
          const defaultAddress = addressList.find(addr => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddress(defaultAddress.id);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load grocery items',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Filter grocery items
  const filteredItems = groceryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.inStock;
  });

  // Add item to cart
  const addToCart = (item: GroceryItem) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  // Update cart item quantity
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  // Update special instructions for cart item
  const updateSpecialInstructions = (itemId: string, instructions: string) => {
    setCart(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, specialInstructions: instructions } : item
      )
    );
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = deliveryOptions.find(opt => opt.id === selectedDelivery)?.price || 0;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + deliveryFee + tax + tipAmount;

  // Handle order submission
  const handleSubmitOrder = async () => {
    if (!user?.uid) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to place an order',
        variant: 'destructive'
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add items to your cart',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedAddress) {
      toast({
        title: 'Address Required',
        description: 'Please select a delivery address',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        userId: user.uid,
        type: 'grocery',
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions || ''
        })),
        deliveryAddress: selectedAddress,
        deliveryOption: selectedDelivery,
        deliveryInstructions,
        specialRequests,
        contactlessDelivery,
        leaveAtDoor,
        pricing: {
          subtotal,
          deliveryFee,
          tax,
          tip: tipAmount,
          total
        },
        status: 'pending',
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Clear cart
      setCart([]);
      setDeliveryInstructions('');
      setSpecialRequests('');
      setTipAmount(0);
      setCustomTip('');

      toast({
        title: 'Order Placed Successfully!',
        description: `Your order #${docRef.id.slice(-6)} has been placed and will be delivered soon.`
      });

    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Error',
        description: 'Failed to place order. Please try again.',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grocery Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Grocery Delivery
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Fresh groceries delivered to your door
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search groceries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-700/50 border-gray-600 text-white"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48 bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {groceryCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Grocery Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredItems.map((item) => {
                  const cartItem = cart.find(cartItem => cartItem.id === item.id);
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="bg-gray-800/50 border-gray-700 hover:border-otw-gold/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="aspect-square bg-gray-700/30 rounded-lg mb-3 flex items-center justify-center">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <ShoppingCart className="w-8 h-8 text-gray-500" />
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h3 className="text-white font-medium text-sm leading-tight">{item.name}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {item.category}
                              </Badge>
                            </div>
                            {item.brand && (
                              <p className="text-gray-400 text-xs">{item.brand}</p>
                            )}
                            {item.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span className="text-xs text-gray-400">{item.rating}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-otw-gold font-bold">${item.price.toFixed(2)}</span>
                                <span className="text-gray-400 text-xs ml-1">/{item.unit}</span>
                              </div>
                              {cartItem ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}
                                    className="w-8 h-8 p-0"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="text-white font-medium w-8 text-center">
                                    {cartItem.quantity}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}
                                    className="w-8 h-8 p-0"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => addToCart(item)}
                                  className="bg-otw-gold text-black hover:bg-otw-gold/90"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredItems.length === 0 && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No items found matching your search</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Cart and Checkout */}
          <div className="space-y-6">
            {/* Cart */}
            <Card className="bg-gray-800/50 border-gray-700 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Your Cart</span>
                  <Badge variant="secondary">{cart.length} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.id} className="p-3 bg-gray-700/30 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="text-white text-sm font-medium">{item.name}</h4>
                              <p className="text-gray-400 text-xs">
                                ${item.price.toFixed(2)} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-white text-sm w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <Input
                            placeholder="Special instructions..."
                            value={item.specialInstructions || ''}
                            onChange={(e) => updateSpecialInstructions(item.id, e.target.value)}
                            className="text-xs bg-gray-600/50 border-gray-600 text-white"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Delivery Options */}
                    <div className="space-y-3">
                      <Label className="text-white text-sm font-medium">Delivery Speed</Label>
                      {deliveryOptions.map((option) => (
                        <div
                          key={option.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedDelivery === option.id
                              ? 'border-otw-gold bg-otw-gold/10'
                              : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                          }`}
                          onClick={() => setSelectedDelivery(option.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-otw-gold">{option.icon}</div>
                              <div>
                                <h4 className="text-white text-sm font-medium">{option.name}</h4>
                                <p className="text-gray-400 text-xs">{option.timeRange}</p>
                              </div>
                            </div>
                            <div className="text-otw-gold font-medium text-sm">
                              ${option.price.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Address */}
                    {addresses.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-white text-sm font-medium">Delivery Address</Label>
                        <Select value={selectedAddress} onValueChange={setSelectedAddress}>
                          <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                            <SelectValue placeholder="Select address" />
                          </SelectTrigger>
                          <SelectContent>
                            {addresses.map((address) => (
                              <SelectItem key={address.id} value={address.id}>
                                {address.name} - {address.street}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Delivery Instructions */}
                    <div className="space-y-2">
                      <Label className="text-white text-sm font-medium">Delivery Instructions</Label>
                      <Textarea
                        placeholder="Leave at door, ring bell, etc..."
                        value={deliveryInstructions}
                        onChange={(e) => setDeliveryInstructions(e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white text-sm"
                        rows={2}
                      />
                    </div>

                    {/* Special Requests */}
                    <div className="space-y-2">
                      <Label className="text-white text-sm font-medium">Special Requests</Label>
                      <Textarea
                        placeholder="Substitutions, preferences, etc..."
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white text-sm"
                        rows={2}
                      />
                    </div>

                    {/* Delivery Options */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="contactless"
                          checked={contactlessDelivery}
                          onCheckedChange={setContactlessDelivery}
                        />
                        <Label htmlFor="contactless" className="text-white text-sm">
                          Contactless delivery
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="leaveAtDoor"
                          checked={leaveAtDoor}
                          onCheckedChange={setLeaveAtDoor}
                        />
                        <Label htmlFor="leaveAtDoor" className="text-white text-sm">
                          Leave at door
                        </Label>
                      </div>
                    </div>

                    {/* Tip */}
                    <div className="space-y-3">
                      <Label className="text-white text-sm font-medium">Tip Your Driver</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {[0, 2, 5, 8].map((tip) => (
                          <Button
                            key={tip}
                            size="sm"
                            variant={tipAmount === tip ? 'default' : 'outline'}
                            onClick={() => {
                              setTipAmount(tip);
                              setCustomTip('');
                            }}
                            className="text-xs"
                          >
                            ${tip}
                          </Button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Custom tip"
                          value={customTip}
                          onChange={(e) => {
                            setCustomTip(e.target.value);
                            const amount = parseFloat(e.target.value) || 0;
                            setTipAmount(amount);
                          }}
                          className="bg-gray-700/50 border-gray-600 text-white text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const percentage = subtotal * 0.18; // 18%
                            setTipAmount(percentage);
                            setCustomTip(percentage.toFixed(2));
                          }}
                          className="text-xs whitespace-nowrap"
                        >
                          18%
                        </Button>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-2 pt-4 border-t border-gray-600">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Subtotal</span>
                        <span className="text-white">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Delivery Fee</span>
                        <span className="text-white">${deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Tax</span>
                        <span className="text-white">${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Tip</span>
                        <span className="text-white">${tipAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-600">
                        <span className="text-white">Total</span>
                        <span className="text-otw-gold">${total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Place Order Button */}
                    <Button
                      onClick={handleSubmitOrder}
                      disabled={submitting || cart.length === 0 || !selectedAddress}
                      className="w-full bg-otw-gold text-black hover:bg-otw-gold/90 font-medium"
                    >
                      {submitting ? (
                        'Placing Order...'
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Place Order - ${total.toFixed(2)}
                        </>
                      )}
                    </Button>

                    {!user && (
                      <Alert className="border-yellow-500/50 bg-yellow-500/10">
                        <AlertCircle className="h-4 w-4 text-yellow-400" />
                        <AlertDescription className="text-yellow-300">
                          Please sign in to place an order
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}