'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../lib/context/CartContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import {
  FaArrowLeft,
  FaTrash,
  FaPlus,
  FaMinus,
  FaShoppingBag,
  FaCreditCard,
} from 'react-icons/fa';
import { PromoCodeInput } from '../../components/cart/PromoCodeInput';

export default function CartPage() {
  const router = useRouter();
  const {
    items = [], // Default to empty array
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal = 0,
    discount = 0,
    shippingFee = 0,
    tax = 0,
    total = 0,
    itemCount = 0,
    loading = false,
    error = null,
    appliedPromoCode = null,
    promoCodeError = null,
    applyPromoCode,
    removePromoCode,
  } = useCart() || {}; // Fallback to empty object if context is undefined

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (!id || newQuantity < 0) return;
    
    if (newQuantity <= 0) {
      removeFromCart?.(id);
    } else {
      updateQuantity?.(id, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!items || items.length === 0) return;

    // Prepare items for checkout with safe property access
    const checkoutItems = items.map(item => ({
      id: item?.id || '',
      name: item?.name || '',
      price: item?.price || 0,
      quantity: item?.quantity || 1,
      image: item?.image || '',
      description: item?.description || '',
      restaurantId: item?.restaurantId || '',
      restaurantName: item?.restaurantName || '',
      customizations: item?.customizations || {}
    }));
    
    // Navigate to checkout with items
    const itemsParam = encodeURIComponent(JSON.stringify(checkoutItems));
    router.push(`/checkout?items=${itemsParam}`);
  };

  // Show loading state during initial render or when loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart state if no items (using safe length check)
  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6">
            <Link href="/order" className="inline-flex items-center text-orange-600 hover:text-orange-700">
              <FaArrowLeft className="mr-2" /> Continue Shopping
            </Link>
          </div>
          
          <Card className="text-center py-12">
            <CardContent>
              <FaShoppingBag className="mx-auto text-6xl text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link href="/order">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/order" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4">
            <FaArrowLeft className="mr-2" /> Continue Shopping
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600">{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Cart Items</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clearCart?.()}
                  className="text-red-600 hover:text-red-700"
                  disabled={!clearCart || !items || items.length === 0}
                >
                  Clear Cart
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {items?.map((item) => {
                  // Defensive programming for each item
                  const itemId = item?.id || '';
                  const itemName = item?.name || 'Unknown Item';
                  const itemPrice = item?.price || 0;
                  const itemQuantity = item?.quantity || 1;
                  const itemImage = item?.image;
                  const itemRestaurantName = item?.restaurantName;
                  const itemDescription = item?.description;
                  const itemCustomizations = item?.customizations || {};
                  
                  return (
                    <div key={itemId || Math.random()} className="flex items-center space-x-4 p-4 border rounded-lg">
                      {/* Item Image */}
                      <div className="flex-shrink-0">
                        {itemImage ? (
                          <Image
                            src={itemImage}
                            alt={itemName}
                            width={80}
                            height={80}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                            <FaShoppingBag className="text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-grow">
                        <h3 className="font-semibold text-gray-900">{itemName}</h3>
                        {itemRestaurantName && (
                          <p className="text-sm text-gray-600">From {itemRestaurantName}</p>
                        )}
                        {itemDescription && (
                          <p className="text-sm text-gray-600">{itemDescription}</p>
                        )}
                        {itemCustomizations && Object.keys(itemCustomizations).length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {Object.entries(itemCustomizations).map(([key, value]) => (
                              <span key={key} className="mr-2">
                                {key}: {String(value || '')}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="font-semibold text-orange-600 mt-1">
                          ${itemPrice.toFixed(2)} each
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(itemId, itemQuantity - 1)}
                          className="w-8 h-8 p-0"
                          disabled={!itemId}
                        >
                          <FaMinus className="w-3 h-3" />
                        </Button>
                        <Input
                          type="number"
                          value={itemQuantity}
                          onChange={(e) => handleQuantityChange(itemId, parseInt(e.target.value) || 0)}
                          className="w-16 text-center"
                          min="0"
                          disabled={!itemId}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(itemId, itemQuantity + 1)}
                          className="w-8 h-8 p-0"
                          disabled={!itemId}
                        >
                          <FaPlus className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${(itemPrice * itemQuantity).toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem?.(itemId)}
                          className="text-red-600 hover:text-red-700 mt-1"
                          disabled={!itemId || !removeItem}
                        >
                          <FaTrash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                }) || []}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span>${(total * 0.08).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>$3.99</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${(total + (total * 0.08) + 3.99).toFixed(2)}</span>
                </div>
                
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3"
                  size="lg"
                >
                  <FaCreditCard className="mr-2" />
                  Proceed to Checkout
                </Button>
                
                <div className="text-center">
                  <Link href="/order" className="text-orange-600 hover:text-orange-700 text-sm">
                    Continue Shopping
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
