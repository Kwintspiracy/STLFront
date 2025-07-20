// src/lib/api/config.ts

// Environment variables with fallback values
export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || false;

// Dynamic API Configuration based on environment
const getApiBaseUrl = (): string => {
  // In production, use the production API URL
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_API_BASE_URL_PROD || process.env.NEXT_PUBLIC_API_BASE_URL || "https://rough-leaf-6383.fly.dev/api/v1";
  }
  
  // In development, use local API URL
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";
};

export const API_BASE_URL = getApiBaseUrl();

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login/`,
  REGISTER: `${API_BASE_URL}/auth/register/`,
  EMAIL_CONFIRM: `${API_BASE_URL}/auth/register/account-confirm-email/`,
  REFRESH: `${API_BASE_URL}/auth/token/refresh/`,
  LOGOUT: `${API_BASE_URL}/auth/logout/`,
  PASSWORD_RESET: `${API_BASE_URL}/auth/password/reset/`,
  PASSWORD_RESET_CONFIRM: `${API_BASE_URL}/auth/password/reset/confirm/`,
  PASSWORD_CHANGE: `${API_BASE_URL}/auth/password/change/`,
  USER_PROFILE: `${API_BASE_URL}/auth/user/`,
  UPDATE_PROFILE: `${API_BASE_URL}/auth/user/`,
  GOOGLE_LOGIN: `${API_BASE_URL}/auth/google/`,
  DISCORD: `${API_BASE_URL}/auth/discord/`,
};

// Studio endpoints
export const STUDIO_ENDPOINTS = {
  LIST: `${API_BASE_URL}/studios/`,
  CREATE: `${API_BASE_URL}/studios/`,
  DETAIL: (id: number) => `${API_BASE_URL}/studios/${id}/`,
  UPDATE: (id: number) => `${API_BASE_URL}/studios/${id}/`,
  MINE: `${API_BASE_URL}/studios/mine/`,
  FOLLOW: (id: number) => `${API_BASE_URL}/studios/${id}/follow/`,
  UNFOLLOW: (id: number) => `${API_BASE_URL}/studios/${id}/unfollow/`,
  FOLLOW_PREFERENCES: (id: number) => `${API_BASE_URL}/studios/${id}/follow-preferences/`,
  FOLLOWED: `${API_BASE_URL}/studios/following/`,
};

// Search endpoints
export const SEARCH_ENDPOINTS = {
  PRODUCTS: `${API_BASE_URL}/search/products/`,
  SUGGESTIONS: `${API_BASE_URL}/search/suggestions/`,
};

// Product endpoints (public access for list and detail)
export const PRODUCT_ENDPOINTS = {
  LIST: `${API_BASE_URL}/products/products/`,
  DETAIL: (id: number) => `${API_BASE_URL}/products/products/${id}/`,
  CREATE: `${API_BASE_URL}/products/products/`,
  UPDATE: (id: number) => `${API_BASE_URL}/products/products/${id}/`,
  BY_CATEGORY: (categorySlug: string) => `${API_BASE_URL}/products/products/?category=${categorySlug}`,
  BY_TAG: (tagSlug: string) => `${API_BASE_URL}/products/products/?tags=${tagSlug}`,
  BY_STUDIO: (studioId: number) => `${API_BASE_URL}/products/products/?studio=${studioId}`,
  UPLOAD_IMAGE: (id: number) => `${API_BASE_URL}/products/products/${id}/upload_image/`,
  UPLOAD_STL: (id: number) => `${API_BASE_URL}/products/products/${id}/upload_stl/`,
};
