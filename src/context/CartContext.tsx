'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Product } from '@/types/product';
import {
  cartService,
  Cart as BackendCart,
  CartItem as BackendCartItem,
  getOrCreateCartCode
} from '@/lib/api/cartService';

// Frontend cart item interface (mapped from backend)
export interface CartItem {
  id: number;
  product: Product;
  license: 'personal' | 'commercial' | 'extended';
  addedAt: Date;
  backendId: number; // Backend cart item ID for API operations
  includeprolicense: boolean;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  cartCode: string | null;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART_CODE'; payload: string }
  | { type: 'LOAD_CART_SUCCESS'; payload: { cart: BackendCart } }
  | { type: 'ADD_TO_CART_SUCCESS'; payload: { cart: BackendCart } }
  | { type: 'REMOVE_FROM_CART_SUCCESS'; payload: { cartItemId: number } }
  | { type: 'UPDATE_LICENSE_SUCCESS'; payload: { cartItem: BackendCartItem } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_CART_OPEN'; payload: boolean };

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isOpen: false,
  isLoading: false,
  error: null,
  cartCode: null,
};

// Helper function to map backend cart item to frontend cart item
function mapBackendCartItem(backendItem: BackendCartItem): CartItem {
  return {
    id: Date.now() + Math.random(), // Generate unique frontend ID
    product: backendItem.product,
    license: backendItem.includeprolicense ? 'commercial' : 'personal',
    addedAt: new Date(),
    backendId: backendItem.id,
    includeprolicense: backendItem.includeprolicense,
  };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'SET_CART_CODE':
      return {
        ...state,
        cartCode: action.payload,
      };

    case 'LOAD_CART_SUCCESS': {
      const { cart } = action.payload;
      const items = cart.cartitems.map(mapBackendCartItem);

      return {
        ...state,
        items,
        totalItems: items.length,
        totalPrice: cart.carttotal,
        isLoading: false,
        error: null,
        cartCode: cart.cart_code,
      };
    }

    case 'ADD_TO_CART_SUCCESS': {
      const { cart } = action.payload;
      const items = cart.cartitems.map(mapBackendCartItem);

      return {
        ...state,
        items,
        totalItems: items.length,
        totalPrice: cart.carttotal,
        isLoading: false,
        error: null,
        cartCode: cart.cart_code,
      };
    }

    case 'REMOVE_FROM_CART_SUCCESS': {
      const { cartItemId } = action.payload;
      const newItems = state.items.filter(item => item.backendId !== cartItemId);

      return {
        ...state,
        items: newItems,
        totalItems: newItems.length,
        totalPrice: newItems.reduce((sum, item) => sum + parseFloat(item.product.price), 0),
        isLoading: false,
        error: null,
      };
    }

    case 'UPDATE_LICENSE_SUCCESS': {
      const { cartItem } = action.payload;
      const updatedItems = state.items.map(item =>
        item.backendId === cartItem.id
          ? {
            ...item,
            includeprolicense: cartItem.includeprolicense,
            license: (cartItem.includeprolicense ? 'commercial' : 'personal') as 'personal' | 'commercial' | 'extended',
          }
          : item
      );

      return {
        ...state,
        items: updatedItems,
        isLoading: false,
        error: null,
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

    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addToCart: (product: Product, includeProlicense?: boolean) => Promise<void>;
  removeFromCart: (backendId: number) => Promise<void>;
  updateLicense: (backendId: number, includeProlicense: boolean) => Promise<void>;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  loadCart: () => Promise<void>;
  isProductInCart: (productId: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Get cart code for anonymous users
      const cartCode = getOrCreateCartCode();
      dispatch({ type: 'SET_CART_CODE', payload: cartCode });

      const cart = await cartService.getCart(cartCode);
      dispatch({ type: 'LOAD_CART_SUCCESS', payload: { cart } });
    } catch (error: unknown) {
      console.error('Error loading cart:', error);

      // Handle 404 (Cart not found) by creating a new cart
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          console.log('Cart not found (404), creating new cart...');
          // Clear invalid cart code
          localStorage.removeItem('cart_code');
          // Create new cart code
          const newCartCode = getOrCreateCartCode();
          dispatch({ type: 'SET_CART_CODE', payload: newCartCode });

          // Try to get cart again (this should create a new empty cart on backend if it auto-creates, 
          // or we might need to just set empty state if backend doesn't auto-create on get)
          // Assuming backend creates on GET or we just start fresh
          dispatch({ type: 'CLEAR_CART' });
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
      }

      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
    }
  };

  const addToCart = async (product: Product, includeProlicense: boolean = false) => {
    try {
      // Prevent adding if already loading or product already in cart
      if (state.isLoading || isProductInCart(product.id)) {
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });

      const cartCode = state.cartCode || getOrCreateCartCode();
      const response = await cartService.addToCart(product.id, cartCode);

      // If commercial license was requested, update the cart item immediately
      if (includeProlicense && response.data.cartitems.length > 0) {
        // Find the newly added item - look for the product that matches our product ID
        const newItem = response.data.cartitems.find(item =>
          item.product.id === product.id && !item.includeprolicense
        );

        if (newItem) {
          // Update the license for the newly added item
          await cartService.editCartItem(newItem.id, true);

          // Reload the cart to get the updated state with correct pricing
          const updatedCart = await cartService.getCart(cartCode);
          dispatch({ type: 'ADD_TO_CART_SUCCESS', payload: { cart: updatedCart } });
          return;
        }
      }

      dispatch({ type: 'ADD_TO_CART_SUCCESS', payload: { cart: response.data } });
    } catch (error: unknown) {
      console.error('Error adding to cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' });
    }
  };

  const removeFromCart = async (backendId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      await cartService.removeFromCart(backendId);
      dispatch({ type: 'REMOVE_FROM_CART_SUCCESS', payload: { cartItemId: backendId } });
    } catch (error: unknown) {
      console.error('Error removing from cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from cart' });
    }
  };

  const updateLicense = async (backendId: number, includeProlicense: boolean) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await cartService.editCartItem(backendId, includeProlicense);
      dispatch({ type: 'UPDATE_LICENSE_SUCCESS', payload: { cartItem: response.data } });
    } catch (error: unknown) {
      console.error('Error updating license:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update license' });
    }
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

  const isProductInCart = (productId: number): boolean => {
    return state.items.some(item => item.product.id === productId);
  };

  const value: CartContextType = {
    state,
    addToCart,
    removeFromCart,
    updateLicense,
    clearCart,
    toggleCart,
    setCartOpen,
    loadCart,
    isProductInCart,
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
