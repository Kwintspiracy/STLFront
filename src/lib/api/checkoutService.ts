// src/lib/api/checkoutService.ts

import { apiRequest } from './httpClient';
import { API_BASE_URL } from './config';

export interface CheckoutRequest {
  items: Array<{
    product_id: number;
    license: 'personal' | 'commercial' | 'extended';
    quantity?: number;
  }>;
  coupon_code?: string;
}

export interface CheckoutResponse {
  data: {
    url: string;
    id: string;
    object: string;
    status: string;
    // Add other Stripe session properties as needed
    [key: string]: unknown;
  };
}

// Legacy interface for backward compatibility
export interface LegacyCheckoutResponse {
  checkout_url: string;
  session_id?: string;
  payment_intent_id?: string;
}

export const CHECKOUT_ENDPOINTS = {
  CREATE_SESSION: `${API_BASE_URL}/checkout/`,
};

export const checkoutService = {
  /**
   * Create a Stripe checkout session
   */
  createCheckoutSession: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
    try {
      console.log('🛒 CHECKOUT REQUEST - Sending data to backend:');
      console.log('📤 Endpoint:', CHECKOUT_ENDPOINTS.CREATE_SESSION);
      console.log('📤 Request data:', JSON.stringify(data, null, 2));
      console.log('📤 Items count:', data.items.length);
      console.log('📤 Coupon code:', data.coupon_code || 'None');
      
      const response = await apiRequest.post<CheckoutResponse>(
        CHECKOUT_ENDPOINTS.CREATE_SESSION,
        data
      );
      
      console.log('🛒 CHECKOUT RESPONSE - Received from backend:');
      console.log('📥 Status:', response.status);
      console.log('📥 Headers:', response.headers);
      console.log('📥 Full response data:', JSON.stringify(response.data, null, 2));
      console.log('📥 Has data.url?', 'data' in response.data && 'url' in response.data.data);
      console.log('📥 data.url value:', response.data.data?.url);
      console.log('📥 Response keys:', Object.keys(response.data));
      console.log('📥 Data keys:', response.data.data ? Object.keys(response.data.data) : 'No data object');
      
      return response.data;
    } catch (error: unknown) {
      console.error('🛒 CHECKOUT ERROR - Request failed:');
      console.error('❌ Error object:', error);
      
      // Type guard for error with message
      const isErrorWithMessage = (err: unknown): err is Error => {
        return err instanceof Error;
      };
      
      // Type guard for axios error
      const isAxiosError = (err: unknown): err is { response?: { data: unknown; status: number; headers: unknown } } => {
        return typeof err === 'object' && err !== null && 'response' in err;
      };
      
      if (isErrorWithMessage(error)) {
        console.error('❌ Error message:', error.message);
      }
      
      if (isAxiosError(error) && error.response) {
        console.error('❌ Error response:', error.response.data);
        console.error('❌ Error status:', error.response.status);
        console.error('❌ Error headers:', error.response.headers);
      }
      
      throw error;
    }
  },
};
