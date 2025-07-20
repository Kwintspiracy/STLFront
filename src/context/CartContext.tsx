'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Product } from '@/types/product';

export interface CartItem {
  id: number;
  product: Product;
  license: 'personal' | 'commercial' | 'extended';
  addedAt: Date;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: { product: Product; license?: 'personal' | 'commercial' | 'extended' } }
  | { type: 'REMOVE_FROM_CART'; payload: { id: number } }
  | { type: 'UPDATE_LICENSE'; payload: { id: number; license: 'personal' | 'commercial' | 'extended' } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_CART_OPEN'; payload: boolean }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isOpen: false,
};

function calculateTotals(items: CartItem[]): { totalItems: number; totalPrice: number } {
  const totalItems = items.length;
  const totalPrice = items.reduce((sum, item) => {
    const basePrice = parseFloat(item.product.price);
    let price = basePrice;
    
    // Add commercial license fee if applicable
    if (item.license === 'commercial' && item.product.professional_license_fee) {
      price += parseFloat(item.product.professional_license_fee);
    } else if (item.license === 'extended') {
      // Extended license is typically 2x the commercial price
      const commercialFee = item.product.professional_license_fee ? parseFloat(item.product.professional_license_fee) : 0;
      price += commercialFee * 2;
    }
    
    return sum + price;
  }, 0);
  
  return { totalItems, totalPrice };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, license = 'personal' } = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => item.product.id === product.id && item.license === license
      );

      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Item already exists with same license, don't add duplicate
        return state;
      } else {
        // Add new item
        const newItem: CartItem = {
          id: Date.now(), // Simple ID generation
          product,
          license,
          addedAt: new Date(),
        };
        newItems = [...state.items, newItem];
      }

      const { totalItems, totalPrice } = calculateTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
      };
    }

    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter(item => item.id !== action.payload.id);
      const { totalItems, totalPrice } = calculateTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
      };
    }


    case 'UPDATE_LICENSE': {
      const { id, license } = action.payload;
      const newItems = state.items.map(item =>
        item.id === id ? { ...item, license } : item
      );
      
      const { totalItems, totalPrice } = calculateTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case 'SET_CART_OPEN':
      return {
        ...state,
        isOpen: action.payload,
      };

    case 'LOAD_CART': {
      const items = action.payload;
      const { totalItems, totalPrice } = calculateTotals(items);
      
      return {
        ...state,
        items,
        totalItems,
        totalPrice,
      };
    }

    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addToCart: (product: Product, license?: 'personal' | 'commercial' | 'extended') => void;
  removeFromCart: (id: number) => void;
  updateLicense: (id: number, license: 'personal' | 'commercial' | 'extended') => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'stlforge_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart: CartItem[] = JSON.parse(savedCart);
        // Convert date strings back to Date objects
        const cartWithDates = parsedCart.map(item => ({
          ...item,
          addedAt: new Date(item.addedAt),
        }));
        dispatch({ type: 'LOAD_CART', payload: cartWithDates });
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state.items]);

  const addToCart = (product: Product, license: 'personal' | 'commercial' | 'extended' = 'personal') => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, license } });
  };

  const removeFromCart = (id: number) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { id } });
  };


  const updateLicense = (id: number, license: 'personal' | 'commercial' | 'extended') => {
    dispatch({ type: 'UPDATE_LICENSE', payload: { id, license } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const setCartOpen = (open: boolean) => {
    dispatch({ type: 'SET_CART_OPEN', payload: open });
  };

  const value: CartContextType = {
    state,
    addToCart,
    removeFromCart,
    updateLicense,
    clearCart,
    toggleCart,
    setCartOpen,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
