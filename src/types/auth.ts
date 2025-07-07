// src/types/auth.ts

export interface AuthResponse {
  access: string;
  refresh: string;
  user: ApiUser;
}

export interface ApiUser {
  pk: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  role?: 'member' | 'admin' | 'owner'; // Studio role if user is part of a studio
  profilePicture?: string; // Profile picture URL
  studio?: {
    id: number;
    name: string;
  }; // Studio information if user is part of a studio
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password1: string;
  password2: string;
}

export interface RegisterResponse {
  detail: string;
}

export interface EmailConfirmResponse {
  detail: string;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
}

export interface PasswordChangeRequest {
  old_password: string;
  new_password1: string;
  new_password2: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  uid: string;
  token: string;
  new_password1: string;
  new_password2: string;
}

// Auth state types
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: ApiUser | null;
  error: string | null;
}

// Token storage types
export interface TokenPair {
  access: string;
  refresh: string;
}
