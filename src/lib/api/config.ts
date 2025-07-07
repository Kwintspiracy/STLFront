// src/lib/api/config.ts
export const USE_MOCK_DATA = false; // Set to true to use mock data for products
export const USE_REAL_API = true; // Set to false to disable real API calls for auth

// API Configuration
export const API_BASE_URL = "http://127.0.0.1:8000/api";
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
};

// Studio endpoints
export const STUDIO_ENDPOINTS = {
  CREATE: USE_REAL_API ? `${REAL_API_BASE_URL}/studio/create/` : `${API_BASE_URL}/studio/create/`,
  DETAIL: (id: number) => USE_REAL_API ? `${REAL_API_BASE_URL}/studio/${id}/` : `${API_BASE_URL}/studio/${id}/`,
  UPDATE: (id: number) => USE_REAL_API ? `${REAL_API_BASE_URL}/studio/${id}/update/` : `${API_BASE_URL}/studio/${id}/update/`,
  MINE: USE_REAL_API ? `${REAL_API_BASE_URL}/studio/mine/` : `${API_BASE_URL}/studio/mine/`,
  FOLLOW: (id: number) => USE_REAL_API ? `${REAL_API_BASE_URL}/studio/${id}/follow/` : `${API_BASE_URL}/studio/${id}/follow/`,
  UNFOLLOW: (id: number) => USE_REAL_API ? `${REAL_API_BASE_URL}/studio/${id}/unfollow/` : `${API_BASE_URL}/studio/${id}/unfollow/`,
  FOLLOW_PREFERENCES: (id: number) => USE_REAL_API ? `${REAL_API_BASE_URL}/studio/${id}/follow-preferences/` : `${API_BASE_URL}/studio/${id}/follow-preferences/`,
  FOLLOWED: USE_REAL_API ? `${REAL_API_BASE_URL}/studio/followed/` : `${API_BASE_URL}/studio/followed/`,
};
