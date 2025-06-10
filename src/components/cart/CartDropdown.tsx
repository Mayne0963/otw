'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, X, ChevronRight, Trash2, Tag, Check, Minus, Plus } from 'lucide-react';
import { useCart } from '../../lib/context/CartContext';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import Button from '../Button';

export default function CartDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const { 
    items, 
    itemCount, 
    removeItem, 
    updateQuantity, 
    total,
    subtotal,
    discount,
    shippingFee,
    appliedPromoCode,
    promoCodeError,
    applyPromoCode,
    removePromoCode
  } = useCart();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  // Close dropdown when pressing escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setShowPromoInput(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);
  
  const handlePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const success = applyPromoCode(promoCode);
    if (success) {
      setPromoCode('');
      setShowPromoInput(false);
    }
    
    setIsApplying(false);
  };
  
  const handleRemovePromoCode = () => {
    removePromoCode();
    setPromoCode('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-1 px-4 py-2 text-white hover:text-otw-gold-600 transition-colors relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <ShoppingBag className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-otw-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-otw-black-900 rounded-md shadow-otw-md z-50 border border-otw-black-800 overflow-hidden transform transition-all duration-300 ease-out animate-in slide-in-from-top-2 fade-in-0">
          <div className="p-4 border-b border-otw-black-800 flex justify-between items-center">
            <h3 className="font-medium">Your Cart ({itemCount})</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white"
              aria-label="Close cart"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <ShoppingBag className="h-12 w-12 text-white/50" />
              </div>
              <p className="text-white/70 mb-4">Your cart is empty</p>
              <Link
                href="/restaurants"
                className="inline-block w-full"
                onClick={() => setIsOpen(false)}
              >
                <Button variant="primary" size="sm">
                  Browse Broski's Kitchen
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="max-h-80 overflow-y-auto p-2">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 hover:bg-otw-black-800 rounded-md transition-all duration-200 transform hover:scale-[1.02] animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                      <Image
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {item.name}
                      </h4>
                      <p className="text-white/60 text-xs">
                        ${item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center mt-1 border border-otw-black-700 rounded-md overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.max(1, item.quantity - 1),
                            )
                          }
                          className="h-6 w-6 flex items-center justify-center bg-otw-black-800 hover:bg-otw-black-700 transition-all duration-200 transform hover:scale-110"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="mx-2 text-sm bg-otw-black-900 px-2 py-1 min-w-[30px] text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="h-6 w-6 flex items-center justify-center bg-otw-black-800 hover:bg-otw-black-700 transition-all duration-200 transform hover:scale-110"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-white/60 hover:text-otw-red-600 transition-all duration-200 transform hover:scale-110 hover:rotate-12"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-otw-black-800">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-white/60">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-500 animate-fade-in">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        Discount
                      </span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {shippingFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-white/60">Shipping</span>
                      <span className="font-medium">${shippingFee.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-bold pt-2 border-t border-otw-black-700">
                    <span>Total</span>
                    <span className="text-otw-gold-600">${total.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Applied Promo Code */}
                {appliedPromoCode && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-md p-2 mb-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" />
                        <span className="text-green-500 text-sm font-medium">
                          {appliedPromoCode.code}
                        </span>
                      </div>
                      <button
                        onClick={handleRemovePromoCode}
                        className="text-white/60 hover:text-red-500 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Promo Code Input */}
                {!appliedPromoCode && (
                  <div className="mb-3">
                    {!showPromoInput ? (
                      <button
                        onClick={() => setShowPromoInput(true)}
                        className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                      >
                        <Tag className="h-3 w-3" />
                        Add promo code
                      </button>
                    ) : (
                      <form onSubmit={handlePromoCode} className="animate-fade-in">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            placeholder="Enter code"
                            className="flex-1 bg-otw-black-800 border border-otw-black-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-otw-gold-600"
                            disabled={isApplying}
                            autoFocus
                          />
                          <button
                            type="submit"
                            disabled={isApplying || !promoCode.trim()}
                            className="bg-otw-red-600 hover:bg-otw-red-700 disabled:opacity-50 px-2 py-1 rounded text-sm transition-colors"
                          >
                            {isApplying ? (
                              <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              'Apply'
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowPromoInput(false);
                              setPromoCode('');
                            }}
                            className="text-white/60 hover:text-white px-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        {promoCodeError && (
                          <p className="text-red-500 text-xs mt-1 animate-fade-in">{promoCodeError}</p>
                        )}
                      </form>
                    )}
                  </div>
                )}
                
                <Link
                  href="/checkout"
                  className="flex items-center justify-between w-full bg-otw-red-600 text-white py-2 px-4 rounded-md hover:bg-otw-red-700 transition-all duration-200 transform hover:scale-[1.02] mb-2"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="font-medium">Checkout</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <button
                  className="w-full text-center text-sm text-white/60 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Continue Shopping
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
