'use client';

export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Input } from '../../components/ui/input';
import type React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../lib/context/CartContext';
import {
  FaShoppingCart,
  FaTrash,
  FaPlus,
  FaMinus,
  FaArrowLeft,
  FaCreditCard,
  FaCog,
  FaTimes,
  FaTag,
  FaCheck,
} from 'react-icons/fa';

export default function CartPage() {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    subtotal, 
    discount,
    discountedSubtotal,
    shippingFee,
    tax, 
    total, 
    clearCart,
    appliedPromoCode,
    promoCodeError,
    applyPromoCode,
    removePromoCode
  } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleQuantityChange = (
    id: string,
    currentQuantity: number,
    change: number,
  ) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    }
  };

  const handlePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const success = applyPromoCode(promoCode);
    if (success) {
      setPromoCode('');
    }
    
    setIsApplying(false);
  };
  
  const handleRemovePromoCode = () => {
    removePromoCode();
    setPromoCode('');
  };

  // Check if an item has customizations
  const hasCustomizations = (item: any) => {
    return item.customizations && Object.keys(item.customizations).length > 0;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

          <div className="bg-[#1A1A1A] rounded-lg p-12 text-center">
            <div className="w-20 h-20 bg-[#222222] rounded-full flex items-center justify-center mx-auto mb-6">
              <FaShoppingCart className="text-gray-500 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-400 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              href="/menu"
              className="btn-primary inline-flex items-center gap-2"
            >
              <FaArrowLeft size={14} /> Browse Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-[#1A1A1A] rounded-lg overflow-hidden border border-[#333333]">
              <div className="p-4 bg-[#111111] border-b border-[#333333] flex justify-between items-center">
                <h2 className="font-bold">Items ({items.length})</h2>
                <button
                  onClick={clearCart}
                  className="text-sm text-gray-400 hover:text-blood-red transition-colors"
                >
                  Clear Cart
                </button>
              </div>

              <ul className="divide-y divide-[#333333]">
                {items.map((item, index) => (
                  <li 
                    key={item.id} 
                    className="p-4 flex flex-col transform transition-all duration-300 ease-in-out hover:bg-[#222222] animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-[#222222] rounded-lg overflow-hidden relative flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image || '/placeholder.svg'}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaShoppingCart className="text-gray-500" />
                          </div>
                        )}
                      </div>

                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">
                            {item.name.split(' (')[0]}
                          </h3>
                          {hasCustomizations(item) && (
                            <span className="bg-gold-foil bg-opacity-20 text-gold-foil text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <FaCog size={10} /> Customized
                            </span>
                          )}
                        </div>
                        <div className="text-gold-foil font-bold mt-1">
                          ${item.price.toFixed(2)}
                        </div>

                        {/* Display customizations if any */}
                        {hasCustomizations(item) && (
                          <div className="mt-2 text-sm text-gray-400">
                            {item.customizations &&
                              Object.values(item.customizations)
                                .flat()
                                .map((option, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between"
                                  >
                                    <span>{option.name}</span>
                                    {option.price > 0 && (
                                      <span>+${option.price.toFixed(2)}</span>
                                    )}
                                  </div>
                                ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-[#333333] rounded-md overflow-hidden">
                          <button
                            className="px-2 py-1 text-white hover:bg-[#333333] transition-all duration-200 transform hover:scale-110"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity, -1)
                            }
                          >
                            <FaMinus size={12} />
                          </button>
                          <span className="px-3 py-1 text-white bg-[#222222] min-w-[40px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            className="px-2 py-1 text-white hover:bg-[#333333] transition-all duration-200 transform hover:scale-110"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity, 1)
                            }
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-gray-400 hover:text-blood-red transition-all duration-200 transform hover:scale-110 hover:rotate-12"
                          aria-label="Remove item"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <Link
                href="/menu"
                className="text-gold-foil hover:underline inline-flex items-center gap-2"
              >
                <FaArrowLeft size={14} /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#1A1A1A] rounded-lg border border-[#333333] p-6">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between transition-all duration-300">
                  <span className="text-gray-400">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-500 animate-fade-in">
                    <span className="flex items-center gap-2">
                      <FaTag size={12} />
                      Discount ({appliedPromoCode?.description})
                    </span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Shipping</span>
                  <span className={shippingFee === 0 ? 'text-green-500' : ''}>
                    {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Tax (8.25%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                {/* Applied Promo Code Display */}
                {appliedPromoCode && (
                  <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaCheck className="text-green-500" size={14} />
                        <span className="text-green-500 font-medium">
                          {appliedPromoCode.code}
                        </span>
                        <span className="text-sm text-gray-400">
                          {appliedPromoCode.description}
                        </span>
                      </div>
                      <button
                        onClick={handleRemovePromoCode}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remove promo code"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Promo Code Input */}
                {!appliedPromoCode && (
                  <form
                    onSubmit={handlePromoCode}
                    className="pt-4 border-t border-[#333333] animate-fade-in"
                  >
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <FaTag size={12} />
                      Promo Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="input flex-grow transition-all duration-200 focus:ring-2 focus:ring-gold-foil focus:border-gold-foil"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                        }}
                        placeholder="Enter code (e.g., WELCOME10)"
                        disabled={isApplying}
                      />
                      <button
                        type="submit"
                        disabled={isApplying || !promoCode.trim()}
                        className="btn-outline whitespace-nowrap transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isApplying ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Applying...
                          </div>
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                    {promoCodeError && (
                      <p className="text-blood-red text-sm mt-1 animate-fade-in">{promoCodeError}</p>
                    )}
                    
                    {/* Promo Code Suggestions */}
                    <div className="mt-3 text-xs text-gray-500">
                      <p>Try these codes:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {['WELCOME10', 'SAVE5', 'BIGORDER', 'FREESHIP'].map((code) => (
                          <button
                            key={code}
                            type="button"
                            onClick={() => setPromoCode(code)}
                            className="bg-[#333333] hover:bg-[#444444] px-2 py-1 rounded text-xs transition-colors"
                          >
                            {code}
                          </button>
                        ))}
                      </div>
                    </div>
                  </form>
                )}

                <div className="flex justify-between pt-4 border-t border-[#333333] font-bold text-lg">
                  <span>Total</span>
                  <span className="text-gold-foil transition-all duration-300">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <FaCreditCard /> Proceed to Checkout
              </Link>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Taxes and shipping calculated at checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
