// src/lib/api/cartService.ts

import { apiRequest } from './httpClient';
import { API_BASE_URL } from './config';
import { Product } from '@/types/product';

// Cart API endpoints
export const CART_ENDPOINTS = {
  GET_CART: `${API_BASE_URL}/cart/`,
  ADD_TO_CART: `${API_BASE_URL}/cart/add/`,
  EDIT_CART_ITEM: `${API_BASE_URL}/cart/edit/`,
  REMOVE_FROM_CART: (cartItemId: number) => `${API_BASE_URL}/cart/remove/${cartItemId}`,
};

// API Types based on the documentation
export interface CartItem {
  id: number;
  product: Product;
  includeprolicense: boolean;
  subtotal: number;
}

export interface Cart {
  id: string;
  cart_code: string;
  cartitems: CartItem[];
  carttotal: number;
}

export interface AddToCartRequest {
  cart_code: string;
  product_id: number;
}

export interface AddToCartResponse {
  message: string;
  data: Cart;
}

export interface EditCartItemRequest {
  cartitem: number;
  includeprolicense: boolean;
}

export interface EditCartItemResponse {
  data: CartItem;
  message: string;
}

// Cart code generation utility
export function generateCartCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 11; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Cart code storage utilities
const CART_CODE_KEY = 'stlforge_cart_code';

export function getStoredCartCode(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CART_CODE_KEY);
}

export function setStoredCartCode(cartCode: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_CODE_KEY, cartCode);
}

export function clearStoredCartCode(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_CODE_KEY);
}

export function getOrCreateCartCode(): string {
  let cartCode = getStoredCartCode();
  if (!cartCode) {
    cartCode = generateCartCode();
    setStoredCartCode(cartCode);
  }
  return cartCode;
}

// Cart service implementation
export const cartService = {
  /**
   * Get cart by cart code (anonymous users) or user's cart (authenticated users)
   */
  getCart: async (cartCode?: string): Promise<Cart> => {
    try {
      const params = cartCode ? { cart_code: cartCode } : {};
      const response = await apiRequest.get<Cart>(CART_ENDPOINTS.GET_CART, { params });
      return response.data;
  } catch (error: unknown) {
      // Type guard for axios error
      const isAxiosError = (err: unknown): err is { response?: { status: number } } => {
        return typeof err === 'object' && err !== null && 'response' in err;
      };
      
      // If cart doesn't exist, return empty cart structure
      if (isAxiosError(error) && error.response?.status === 404) {
        const code = cartCode || getOrCreateCartCode();
        return {
          id: '',
          cart_code: code,
          cartitems: [],
          carttotal: 0,
        };
      }
      throw error;
    }
  },

  /**
   * Add a product to the cart
   */
  addToCart: async (productId: number, cartCode?: string): Promise<AddToCartResponse> => {
    try {
      const code = cartCode || getOrCreateCartCode();
      const requestData: AddToCartRequest = {
        cart_code: code,
        product_id: productId,
      };

      const response = await apiRequest.post<AddToCartResponse>(
        CART_ENDPOINTS.ADD_TO_CART,
        requestData
      );

      return response.data;
    } catch (error) {
      console.error('Add to cart error:', error);
      throw error;
    }
  },

  /**
   * Edit cart item (update professional license)
   */
  editCartItem: async (cartItemId: number, includeProlicense: boolean): Promise<EditCartItemResponse> => {
    try {
      const requestData: EditCartItemRequest = {
        cartitem: cartItemId,
        includeprolicense: includeProlicense,
      };

      const response = await apiRequest.put<EditCartItemResponse>(
        CART_ENDPOINTS.EDIT_CART_ITEM,
        requestData
      );

      return response.data;
    } catch (error) {
      console.error('Edit cart item error:', error);
      throw error;
    }
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (cartItemId: number): Promise<void> => {
    try {
      await apiRequest.delete(CART_ENDPOINTS.REMOVE_FROM_CART(cartItemId));
    } catch (error) {
      console.error('Remove from cart error:', error);
      throw error;
    }
  },
};
