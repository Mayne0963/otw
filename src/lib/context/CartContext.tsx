'use client';

import type React from 'react';

import {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from 'react';
import type { CartContextType, CartItem, PromoCode } from '../../types';
import { toast } from '../../components/ui/use-toast';

// Create the context with a default undefined value
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCode | null>(null);
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);

  // Predefined promo codes
  const promoCodes: PromoCode[] = [
    {
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      description: '10% off your order',
      minOrderAmount: 0,
      maxDiscount: 50,
      isActive: true,
      expiresAt: new Date('2024-12-31'),
    },
    {
      code: 'SAVE5',
      type: 'fixed',
      value: 5,
      description: '$5 off your order',
      minOrderAmount: 25,
      maxDiscount: 5,
      isActive: true,
      expiresAt: new Date('2024-12-31'),
    },
    {
      code: 'BIGORDER',
      type: 'percentage',
      value: 15,
      description: '15% off orders over $50',
      minOrderAmount: 50,
      maxDiscount: 100,
      isActive: true,
      expiresAt: new Date('2024-12-31'),
    },
    {
      code: 'FREESHIP',
      type: 'shipping',
      value: 0,
      description: 'Free shipping',
      minOrderAmount: 30,
      maxDiscount: 10,
      isActive: true,
      expiresAt: new Date('2024-12-31'),
    },
  ];

  // Calculate cart totals
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  
  // Calculate discount
  const calculateDiscount = () => {
    if (!appliedPromoCode || subtotal < appliedPromoCode.minOrderAmount) {
      return 0;
    }
    
    if (appliedPromoCode.type === 'percentage') {
      const discount = (subtotal * appliedPromoCode.value) / 100;
      return Math.min(discount, appliedPromoCode.maxDiscount || discount);
    } else if (appliedPromoCode.type === 'fixed') {
      return Math.min(appliedPromoCode.value, subtotal);
    }
    
    return 0;
  };
  
  const discount = calculateDiscount();
  const discountedSubtotal = subtotal - discount;
  const shippingFee = appliedPromoCode?.type === 'shipping' && subtotal >= appliedPromoCode.minOrderAmount ? 0 : 5;
  const tax = discountedSubtotal * 0.0825; // 8.25% tax rate
  const total = discountedSubtotal + tax + shippingFee;
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  // Add item to cart
  const addItem = (newItem: CartItem) => {
    setLoading(true);
    setError(null);

    try {
      setItems((currentItems) => {
        // For customized items, we don't want to combine them
        if (
          newItem.customizations &&
          Object.keys(newItem.customizations).length > 0
        ) {
          toast({ title: 'Success', description: `${newItem.name} added to your cart` });
          return [...currentItems, newItem];
        }

        // Check if item already exists in cart (for non-customized items)
        const existingItemIndex = currentItems.findIndex(
          (item) =>
            item.id === newItem.id &&
            (!item.customizations ||
              Object.keys(item.customizations).length === 0),
        );

        if (existingItemIndex >= 0) {
          // Update quantity if item exists
          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex].quantity += newItem.quantity;

          toast({ title: 'Success', description: `${newItem.name} quantity increased to ${updatedItems[existingItemIndex].quantity}` });

          return updatedItems;
        } else {
          // Add new item if it doesn't exist
          toast({ title: 'Success', description: `${newItem.name} added to your cart` });
          return [...currentItems, newItem];
        }
      });
    } catch (err) {
      console.error('Failed to add item to cart:', err);
      setError('Failed to add item to cart. Please try again.');
      toast({ title: 'Error', description: 'Failed to add item to cart. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = (id: string) => {
    setLoading(true);
    setError(null);

    try {
      setItems((currentItems) => {
        const itemToRemove = currentItems.find((item) => item.id === id);
        if (itemToRemove) {
          toast({ title: 'Removed', description: `${itemToRemove.name} removed from your cart`, variant: 'destructive' });
        }
        return currentItems.filter((item) => item.id !== id);
      });
    } catch (err) {
      console.error('Failed to remove item from cart:', err);
      setError('Failed to remove item from cart. Please try again.');
      toast({ title: 'Error', description: 'Failed to remove item from cart. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === id ? { ...item, quantity } : item,
        ),
      );
    } catch (err) {
      console.error('Failed to update item quantity:', err);
      setError('Failed to update item quantity. Please try again.');
      toast({ title: 'Error', description: 'Failed to update item quantity. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Apply promo code
  const applyPromoCode = (code: string): boolean => {
    setPromoCodeError(null);
    
    if (!code.trim()) {
      setPromoCodeError('Please enter a promo code');
      return false;
    }
    
    const promoCode = promoCodes.find(
      (promo) => promo.code.toLowerCase() === code.toLowerCase() && promo.isActive
    );
    
    if (!promoCode) {
      setPromoCodeError('Invalid promo code');
      return false;
    }
    
    if (promoCode.expiresAt && new Date() > promoCode.expiresAt) {
      setPromoCodeError('This promo code has expired');
      return false;
    }
    
    if (subtotal < promoCode.minOrderAmount) {
      setPromoCodeError(`Minimum order amount is $${promoCode.minOrderAmount.toFixed(2)}`);
      return false;
    }
    
    setAppliedPromoCode(promoCode);
    toast({ 
      title: 'Promo code applied!', 
      description: `${promoCode.description} has been applied to your order` 
    });
    return true;
  };
  
  // Remove promo code
  const removePromoCode = () => {
    setAppliedPromoCode(null);
    setPromoCodeError(null);
    toast({ 
      title: 'Promo code removed', 
      description: 'The discount has been removed from your order' 
    });
  };

  // Clear cart
  const clearCart = () => {
    setLoading(true);
    setError(null);

    try {
      setItems([]);
      setAppliedPromoCode(null);
      setPromoCodeError(null);
      toast({ title: 'Cart cleared', description: 'All items have been removed from your cart' });
    } catch (err) {
      console.error('Failed to clear cart:', err);
      setError('Failed to clear cart. Please try again.');
      toast({ title: 'Error', description: 'Failed to clear cart. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Load cart from localStorage on mount
  useEffect(() => {
    setLoading(true);
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (err) {
      console.error('Failed to load cart from localStorage:', err);
      setError('Failed to load your cart. Please refresh the page.');
      toast.error('Failed to load your cart. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err);
      setError(
        'Failed to save your cart. Some changes might not persist if you refresh the page.',
      );
      toast.error(
        'Failed to save your cart. Some changes might not persist if you refresh the page.',
      );
    }
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        discount,
        discountedSubtotal,
        shippingFee,
        tax,
        total,
        itemCount,
        loading,
        error,
        appliedPromoCode,
        promoCodeError,
        applyPromoCode,
        removePromoCode,
        promoCodes,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
};
