// src/lib/api/httpClient.ts

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { AUTH_ENDPOINTS } from './config';
import { 
  getAccessToken, 
  getRefreshToken, 
  setTokenCookies, 
  clearTokenCookies,
  isTokenExpired 
} from '@/lib/utils/tokenService';
import type { RefreshTokenResponse } from '@/types/auth';

// Create axios instance
const httpClient: AxiosInstance = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
httpClient.interceptors.request.use(
  (config: any) => {
    const token = getAccessToken();
    
    if (token && !isTokenExpired(token)) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: any) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
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
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return httpClient(originalRequest);
          
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
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    httpClient.get(url, config),
    
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    httpClient.post(url, data, config),
    
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    httpClient.put(url, data, config),
    
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    httpClient.patch(url, data, config),
    
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    httpClient.delete(url, config),
};
