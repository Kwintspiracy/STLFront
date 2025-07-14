'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AuthState, ApiUser, LoginRequest, AuthResponse } from '@/types/auth';
import { AUTH_ENDPOINTS, USE_MOCK_DATA } from '@/lib/api/config';
import { 
  setTokenCookies, 
  clearTokenCookies, 
  hasValidTokens,
  getAccessToken,
  decodeJWTPayload 
} from '@/lib/utils/tokenService';
import { initializeGoogleAuth, signInWithGoogleRedirect } from '@/lib/google-auth';
import { useToast } from './ToastContext';
import axios from 'axios';

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithDiscord: () => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
  });

  const { showError, showSuccess } = useToast();

  // Fetch user data from API
  const fetchUserData = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('No access token');
      }

      const response = await axios.get<ApiUser>(
        AUTH_ENDPOINTS.USER_PROFILE,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }, []);

  // Initialize auth state on mount
  const initializeAuth = useCallback(async () => {
    if (USE_MOCK_DATA) {
      // Skip JWT auth for mock data
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const token = getAccessToken();
    if (token) {
      try {
        const payload = decodeJWTPayload(token);
        if (payload && payload.user_id) {
          // We have a valid token, fetch complete user data from API
          try {
            const userData = await fetchUserData();
            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              user: userData,
              error: null,
            });
          } catch (error) {
            // If fetching user data fails, clear tokens and set unauthenticated
            console.error('Failed to fetch user data:', error);
            clearTokenCookies();
            setAuthState({
              isAuthenticated: false,
              isLoading: false,
              user: null,
              error: null,
            });
          }
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearTokenCookies();
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [fetchUserData]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = useCallback(async (credentials: LoginRequest) => {
    if (USE_MOCK_DATA) {
      showError('Mock data mode is enabled. Please disable it to use real API.');
      return;
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await axios.post<AuthResponse>(
        AUTH_ENDPOINTS.LOGIN,
        credentials,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const { access, refresh, user } = response.data;

      // Store tokens in cookies
      setTokenCookies({ access, refresh });

      // Update auth state
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user,
        error: null,
      });

      showSuccess('Successfully logged in!');

    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Login failed. Please check your credentials.';
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      showError(errorMessage);
      throw error;
    }
  }, [showError, showSuccess]);

  const logout = useCallback(() => {
    clearTokenCookies();
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
    });
    showSuccess('Successfully logged out!');
  }, [showSuccess]);

  const loginWithGoogle = useCallback(async () => {
    if (USE_MOCK_DATA) {
      showError('Mock data mode is enabled. Please disable it to use real API.');
      return;
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Initialize Google Auth if not already done
      await initializeGoogleAuth();
      
      // Redirect to Google OAuth
      signInWithGoogleRedirect();
      
    } catch (error: any) {
      const errorMessage = error.message || 'Google authentication failed';
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      showError(errorMessage);
      throw error;
    }
  }, [showError]);

  const loginWithDiscord = useCallback(async () => {
    if (USE_MOCK_DATA) {
      showError('Mock data mode is enabled. Please disable it to use real API.');
      return;
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Discord OAuth URL
      const discordClientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
      if (!discordClientId) {
        throw new Error('Discord Client ID not configured');
      }

      const redirectUri = `${window.location.origin}/auth/discord/callback`;
      const scope = 'identify email';
      
      const discordAuthUrl = `https://discord.com/api/oauth2/authorize?` +
        `client_id=${discordClientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `prompt=consent`;

      // Redirect to Discord OAuth
      window.location.href = discordAuthUrl;
      
    } catch (error: any) {
      const errorMessage = error.message || 'Discord authentication failed';
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      showError(errorMessage);
      throw error;
    }
  }, [showError]);

  const refreshAuth = useCallback(async () => {
    await initializeAuth();
  }, [initializeAuth]);

  const value: AuthContextType = {
    ...authState,
    login,
    loginWithGoogle,
    loginWithDiscord,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
