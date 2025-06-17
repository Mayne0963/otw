'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../../lib/context/CartContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { cn } from '../../lib/utils';

export default function CartDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    items,
    itemCount,
    total,
    subtotal,
    updateQuantity,
    removeItem,
    loading
  } = useCart();

  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  const handleCartClick = () => {
    if (itemCount > 0) {
      setIsOpen(!isOpen);
    } else {
      router.push('/order');
    }
  };

  const handleCheckout = () => {
    setIsOpen(false);
    router.push('/checkout');
  };

  const handleViewCart = () => {
    setIsOpen(false);
    router.push('/cart');
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  // Show first 5 items in dropdown
  const displayItems = items.slice(0, 5);
  const hasMoreItems = items.length > 5;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Cart Button */}
      <button
        onClick={handleCartClick}
        onMouseEnter={() => itemCount > 0 && setIsOpen(true)}
        className="relative p-2 text-white hover:text-otw-gold-400 transition-colors duration-200 rounded-lg hover:bg-white/10"
        aria-label={`Shopping cart with ${itemCount} items`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <ShoppingCart className="h-6 w-6" aria-hidden="true" />
        {itemCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 bg-otw-red text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse"
            aria-label={`${itemCount} items in cart`}
          >
            {itemCount > 99 ? '99+' : itemCount}
          </Badge>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && itemCount > 0 && (
        <div 
          className="absolute right-0 top-full mt-2 w-96 z-50"
          onMouseLeave={() => setIsOpen(false)}
        >
          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>Cart ({itemCount} items)</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                  aria-label="Close cart preview"
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {/* Cart Items */}
              <div className="space-y-3">
                {displayItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    {/* Item Image */}
                    <div className="flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                          <ShoppingCart className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-grow min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        ${item.price.toFixed(2)} each
                      </p>
                      {item.customizations && Object.keys(item.customizations).length > 0 && (
                        <p className="text-xs text-gray-500 truncate">
                          Customized
                        </p>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="h-6 w-6 p-0"
                        disabled={loading}
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="h-6 w-6 p-0"
                        disabled={loading}
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      disabled={loading}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}

                {/* More Items Indicator */}
                {hasMoreItems && (
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-600">
                      +{items.length - 5} more items
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Cart Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={loading}
                >
                  Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={handleViewCart}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  View Full Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty Cart State */}
      {isOpen && itemCount === 0 && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50">
          <Card className="shadow-xl border-0 bg-white">
            <CardContent className="p-6 text-center">
              <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-sm text-gray-600 mb-4">
                Add some delicious items to get started!
              </p>
              <Link href="/order">
                <Button 
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => setIsOpen(false)}
                >
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
