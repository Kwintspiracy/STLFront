// src/lib/api/httpClient.ts

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig, type AxiosError } from 'axios';
import { AUTH_ENDPOINTS } from './config';
import { 
  getAccessToken, 
  getRefreshToken, 
  setTokenCookies, 
  clearTokenCookies,
  isTokenExpired 
} from '@/lib/utils/tokenService';
import type { RefreshTokenResponse } from '@/types/auth';

// Extend the config type to include _retry property
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Create axios instance
const httpClient: AxiosInstance = axios.create({
  timeout: 30000, // Increased to 30 seconds for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log('🔧 Request interceptor executing for:', config.url);
    console.log('🔧 Request method:', config.method?.toUpperCase());
    console.log('🔧 Request data:', config.data ? JSON.stringify(config.data, null, 2) : 'No data');
    
    const token = getAccessToken();
    console.log('🔑 Token in interceptor:', token ? 'Present' : 'Missing');
    
    if (token) {
      const expired = isTokenExpired(token);
      console.log('🔑 Token expired:', expired);
      
      if (!expired) {
        console.log('✅ Adding Authorization header');
        // Force headers creation and set Authorization
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('📤 Authorization header set:', config.headers['Authorization'] ? 'Yes' : 'No');
      } else {
        console.log('❌ Token expired, not adding header');
      }
    } else {
      console.log('❌ No token available');
    }
    
    console.log('📤 Final request headers:', JSON.stringify(config.headers, null, 2));
    return config;
  },
  (error: AxiosError) => {
    console.error('🔧 Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('📥 Response interceptor - Success response:');
    console.log('📥 URL:', response.config.url);
    console.log('📥 Status:', response.status);
    console.log('📥 Status text:', response.statusText);
    console.log('📥 Headers:', response.headers);
    console.log('📥 Data type:', typeof response.data);
    console.log('📥 Data keys:', response.data && typeof response.data === 'object' ? Object.keys(response.data) : 'Not an object');
    console.log('📥 Full data:', JSON.stringify(response.data, null, 2));
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;
    
    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = getRefreshToken();
      
      if (refreshToken && !isTokenExpired(refreshToken)) {
        try {
          // Attempt to refresh the token
          const response = await axios.post<RefreshTokenResponse>(
            AUTH_ENDPOINTS.REFRESH,
            { refresh: refreshToken },
            {
              headers: { 'Content-Type': 'application/json' },
            }
          );
          
          const newAccessToken = response.data.access;
          
          // Update the access token in cookies
          setTokenCookies({
            access: newAccessToken,
            refresh: refreshToken,
          });
          
          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return httpClient.request(originalRequest);
          
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          clearTokenCookies();
          
          // Only redirect if we're in the browser
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/signin';
          }
          
          return Promise.reject(refreshError);
        }
      } else {
        // No valid refresh token, clear cookies and redirect
        clearTokenCookies();
        
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/signin';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default httpClient;

// Helper function for making authenticated requests
export const apiRequest = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    httpClient.get(url, config),
    
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    httpClient.post(url, data, config),
    
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    httpClient.put(url, data, config),
    
  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    httpClient.patch(url, data, config),
    
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    httpClient.delete(url, config),
};
