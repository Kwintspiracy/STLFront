// src/lib/api/config.ts
export const USE_MOCK_DATA = false; // Set to true to use mock data for products
export const USE_REAL_API = false; // Set to false to disable real API calls for auth

// API Configuration
export const API_BASE_URL = "http://127.0.0.1:8000/api/v1";
export const REAL_API_BASE_URL = "https://little-sea-1837.fly.dev";

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: USE_REAL_API ? `${REAL_API_BASE_URL}/auth/login/` : `${API_BASE_URL}/auth/login/`,
  REGISTER: USE_REAL_API ? `${REAL_API_BASE_URL}/auth/register/` : `${API_BASE_URL}/auth/register/`,
  EMAIL_CONFIRM: USE_REAL_API ? `${REAL_API_BASE_URL}/auth/register/account-confirm-email/` : `${API_BASE_URL}/auth/register/account-confirm-email/`,
  REFRESH: USE_REAL_API ? `${REAL_API_BASE_URL}/auth/token/refresh/` : `${API_BASE_URL}/auth/token/refresh/`,
  LOGOUT: USE_REAL_API ? `${REAL_API_BASE_URL}/auth/logout/` : `${API_BASE_URL}/auth/logout/`,
  PASSWORD_RESET: USE_REAL_API ? `${REAL_API_BASE_URL}/auth/password/reset/` : `${API_BASE_URL}/auth/password/reset/`,
  PASSWORD_RESET_CONFIRM: USE_REAL_API ? `${REAL_API_BASE_URL}/auth/password/reset/confirm/` : `${API_BASE_URL}/auth/password/reset/confirm/`,
  PASSWORD_CHANGE: USE_REAL_API ? `${REAL_API_BASE_URL}/auth/password/change/` : `${API_BASE_URL}/auth/password/change/`,
  USER_PROFILE: USE_REAL_API ? `${REAL_API_BASE_URL}/auth/user/` : `${API_BASE_URL}/auth/user/`,
  UPDATE_PROFILE: USE_REAL_API ? `${REAL_API_BASE_URL}/auth/user/` : `${API_BASE_URL}/auth/user/`,
  GOOGLE_LOGIN: USE_REAL_API ? `${REAL_API_BASE_URL}/auth/google/` : `${API_BASE_URL}/auth/google/`,
  DISCORD: USE_REAL_API ? `${REAL_API_BASE_URL}/auth/discord/` : `${API_BASE_URL}/auth/discord/`,
};

// Studio endpoints
export const STUDIO_ENDPOINTS = {
  LIST: USE_REAL_API ? `${REAL_API_BASE_URL}/studio/` : `${API_BASE_URL}/studios/`,
  CREATE: USE_REAL_API ? `${REAL_API_BASE_URL}/studio/create/` : `${API_BASE_URL}/studios/`,
  DETAIL: (id: number) => USE_REAL_API ? `${REAL_API_BASE_URL}/studio/${id}/` : `${API_BASE_URL}/studios/${id}/`,
  UPDATE: (id: number) => USE_REAL_API ? `${REAL_API_BASE_URL}/studio/${id}/update/` : `${API_BASE_URL}/studios/${id}/`,
  MINE: USE_REAL_API ? `${REAL_API_BASE_URL}/studio/mine/` : `${API_BASE_URL}/studios/mine/`,
  FOLLOW: (id: number) => USE_REAL_API ? `${REAL_API_BASE_URL}/studio/${id}/follow/` : `${API_BASE_URL}/studios/${id}/follow/`,
  UNFOLLOW: (id: number) => USE_REAL_API ? `${REAL_API_BASE_URL}/studio/${id}/unfollow/` : `${API_BASE_URL}/studios/${id}/unfollow/`,
  FOLLOW_PREFERENCES: (id: number) => USE_REAL_API ? `${REAL_API_BASE_URL}/studio/${id}/follow-preferences/` : `${API_BASE_URL}/studios/${id}/follow-preferences/`,
  FOLLOWED: USE_REAL_API ? `${REAL_API_BASE_URL}/studio/followed/` : `${API_BASE_URL}/studios/following/`,
};

// Search endpoints
export const SEARCH_ENDPOINTS = {
  PRODUCTS: USE_REAL_API ? `${REAL_API_BASE_URL}/search/products/` : `${API_BASE_URL}/search/products/`,
  SUGGESTIONS: USE_REAL_API ? `${REAL_API_BASE_URL}/search/suggestions/` : `${API_BASE_URL}/search/suggestions/`,
};

// Product endpoints (public access for list and detail)
export const PRODUCT_ENDPOINTS = {
  LIST: USE_REAL_API ? `${REAL_API_BASE_URL}/product/products/` : `${API_BASE_URL}/products/products/`,
  DETAIL: (id: number) => USE_REAL_API ? `${REAL_API_BASE_URL}/product/products/${id}/` : `${API_BASE_URL}/products/products/${id}/`,
  CREATE: USE_REAL_API ? `${REAL_API_BASE_URL}/product/products/create/` : `${API_BASE_URL}/products/products/`,
  UPDATE: (id: number) => USE_REAL_API ? `${REAL_API_BASE_URL}/product/products/${id}/update/` : `${API_BASE_URL}/products/products/${id}/`,
  BY_CATEGORY: (categorySlug: string) => USE_REAL_API ? `${REAL_API_BASE_URL}/product/products/?category=${categorySlug}` : `${API_BASE_URL}/products/products/?category=${categorySlug}`,
  BY_TAG: (tagSlug: string) => USE_REAL_API ? `${REAL_API_BASE_URL}/product/products/?tags=${tagSlug}` : `${API_BASE_URL}/products/products/?tags=${tagSlug}`,
  BY_STUDIO: (studioId: number) => USE_REAL_API ? `${REAL_API_BASE_URL}/product/products/?studio=${studioId}` : `${API_BASE_URL}/products/products/?studio=${studioId}`,
  UPLOAD_IMAGE: (id: number) => USE_REAL_API ? `${REAL_API_BASE_URL}/product/products/${id}/upload_image/` : `${API_BASE_URL}/products/products/${id}/upload_image/`,
  UPLOAD_STL: (id: number) => USE_REAL_API ? `${REAL_API_BASE_URL}/product/products/${id}/upload_stl/` : `${API_BASE_URL}/products/products/${id}/upload_stl/`,
};
