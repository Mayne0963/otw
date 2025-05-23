"use client";

import type React from "react";

import {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import type { CartContextType, CartItem } from "../../types";
import { toast } from "../../components/ui/use-toast";

// Create the context with a default undefined value
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate cart totals
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.0825; // 8.25% tax rate
  const total = subtotal + tax;
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
          toast.success(`${newItem.name} added to your cart`, 3000);
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

          toast.success(
            `${newItem.name} quantity increased to ${updatedItems[existingItemIndex].quantity}`,
            3000,
          );

          return updatedItems;
        } else {
          // Add new item if it doesn't exist
          toast.success(`${newItem.name} added to your cart`, 3000);
          return [...currentItems, newItem];
        }
      });
    } catch (err) {
      console.error("Failed to add item to cart:", err);
      setError("Failed to add item to cart. Please try again.");
      toast.error("Failed to add item to cart. Please try again.");
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
          toast.error(`${itemToRemove.name} removed from your cart`, 3000);
        }
        return currentItems.filter((item) => item.id !== id);
      });
    } catch (err) {
      console.error("Failed to remove item from cart:", err);
      setError("Failed to remove item from cart. Please try again.");
      toast.error("Failed to remove item from cart. Please try again.");
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
      console.error("Failed to update item quantity:", err);
      setError("Failed to update item quantity. Please try again.");
      toast.error("Failed to update item quantity. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = () => {
    setLoading(true);
    setError(null);

    try {
      setItems([]);
      toast.info("All items have been removed from your cart", 3000);
    } catch (err) {
      console.error("Failed to clear cart:", err);
      setError("Failed to clear cart. Please try again.");
      toast.error("Failed to clear cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load cart from localStorage on mount
  useEffect(() => {
    setLoading(true);
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (err) {
      console.error("Failed to load cart from localStorage:", err);
      setError("Failed to load your cart. Please refresh the page.");
      toast.error("Failed to load your cart. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(items));
    } catch (err) {
      console.error("Failed to save cart to localStorage:", err);
      setError(
        "Failed to save your cart. Some changes might not persist if you refresh the page.",
      );
      toast.error(
        "Failed to save your cart. Some changes might not persist if you refresh the page.",
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
        tax,
        total,
        itemCount,
        loading,
        error,
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
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
};
