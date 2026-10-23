'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, OrderItem } from '@/types';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerDetails {
  name: string;
  location: string;
  whatsapp: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  checkoutStep: 1 | 2;
  setCheckoutStep: (step: 1 | 2) => void;
  customerDetails: CustomerDetails;
  setCustomerDetails: React.Dispatch<React.SetStateAction<CustomerDetails>>;
  resetCheckout: () => void;
  validateCartItems: (latestProducts: Product[]) => {
    validItems: CartItem[];
    issues: string[];
  };
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    location: '',
    whatsapp: '',
  });

  const addToCart = (product: Product, quantity = 1) => {
    if (!product.isAvailable || product.stockQuantity <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stockQuantity);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stockQuantity) }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const max = item.product.stockQuantity || 999;
          return { ...item, quantity: Math.min(quantity, max) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const resetCheckout = () => {
    setIsCheckoutOpen(false);
    setCheckoutStep(1);
    // Keep customer details so they don't have to retype if they reopen
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Validate cart against live database products
  const validateCartItems = (latestProducts: Product[]) => {
    const issues: string[] = [];
    const validItems: CartItem[] = [];

    const productMap = new Map(latestProducts.map((p) => [p.id, p]));

    for (const item of cart) {
      const liveProduct = productMap.get(item.product.id);
      if (!liveProduct) {
        issues.push(`"${item.product.name}" is no longer available in the store.`);
      } else if (!liveProduct.isAvailable) {
        issues.push(`"${liveProduct.name}" is currently marked out of stock or inactive.`);
      } else if (liveProduct.stockQuantity < item.quantity) {
        if (liveProduct.stockQuantity <= 0) {
          issues.push(`"${liveProduct.name}" is currently sold out.`);
        } else {
          issues.push(
            `"${liveProduct.name}" only has ${liveProduct.stockQuantity} item(s) left in stock.`
          );
          validItems.push({
            product: liveProduct,
            quantity: liveProduct.stockQuantity,
          });
        }
      } else {
        validItems.push({
          product: liveProduct,
          quantity: item.quantity,
        });
      }
    }

    return { validItems, issues };
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        checkoutStep,
        setCheckoutStep,
        customerDetails,
        setCustomerDetails,
        resetCheckout,
        validateCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
