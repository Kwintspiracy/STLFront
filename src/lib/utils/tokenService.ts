// src/lib/utils/tokenService.ts

import type { TokenPair } from '@/types/auth';

// Cookie configuration
const COOKIE_CONFIG = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  SECURE: process.env.NODE_ENV === 'production',
  SAME_SITE: 'lax' as const, // Changed from 'strict' to 'lax' for better compatibility
  PATH: '/',
};

// Helper function to set httpOnly cookies (server-side only)
export function setTokenCookies(tokens: TokenPair) {
  // This will be used in server actions or API routes
  // For client-side, we'll use a different approach
  if (typeof window === 'undefined') {
    // Server-side cookie setting would go here
    // This is typically done in API routes or server actions
    return;
  }
  
  // Client-side: Store in secure cookies via document.cookie
  // Note: These won't be httpOnly but will be secure
  const accessExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  document.cookie = `${COOKIE_CONFIG.ACCESS_TOKEN}=${tokens.access}; expires=${accessExpiry.toUTCString()}; path=${COOKIE_CONFIG.PATH}; secure=${COOKIE_CONFIG.SECURE}; samesite=${COOKIE_CONFIG.SAME_SITE}`;
  document.cookie = `${COOKIE_CONFIG.REFRESH_TOKEN}=${tokens.refresh}; expires=${refreshExpiry.toUTCString()}; path=${COOKIE_CONFIG.PATH}; secure=${COOKIE_CONFIG.SECURE}; samesite=${COOKIE_CONFIG.SAME_SITE}`;
}

// Get token from cookies
export function getTokenFromCookies(tokenType: 'access' | 'refresh'): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const cookieName = tokenType === 'access' ? COOKIE_CONFIG.ACCESS_TOKEN : COOKIE_CONFIG.REFRESH_TOKEN;
  const cookies = document.cookie.split(';');
  
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === cookieName) {
      return value || null;
    }
  }
  
  return null;
}

// Get access token
export function getAccessToken(): string | null {
  return getTokenFromCookies('access');
}

// Get refresh token
export function getRefreshToken(): string | null {
  return getTokenFromCookies('refresh');
}

// Clear all auth cookies
export function clearTokenCookies() {
  if (typeof window === 'undefined') {
    return;
  }
  
  const pastDate = new Date(0).toUTCString();
  document.cookie = `${COOKIE_CONFIG.ACCESS_TOKEN}=; expires=${pastDate}; path=${COOKIE_CONFIG.PATH}`;
  document.cookie = `${COOKIE_CONFIG.REFRESH_TOKEN}=; expires=${pastDate}; path=${COOKIE_CONFIG.PATH}`;
}

// Check if user has valid tokens
export function hasValidTokens(): boolean {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  
  return !!(accessToken || refreshToken);
}

// JWT payload interface
interface JWTPayload {
  exp?: number;
  iat?: number;
  user_id?: number;
  email?: string;
  [key: string]: unknown;
}

// Decode JWT payload (client-side only, for non-sensitive data)
export function decodeJWTPayload(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as JWTPayload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWTPayload(token);
  if (!payload || !payload.exp) {
    return true;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}
