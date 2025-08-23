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
    const token = getAccessToken();
    
    if (token) {
      const expired = isTokenExpired(token);
      
      if (!expired) {
        // Force headers creation and set Authorization
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
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
