// services/authService.ts
import { saveSession } from "@/lib/utils/sessionService";
import { AUTH_ENDPOINTS } from "./config";
import { setTokenCookies, clearTokenCookies, getAccessToken } from "@/lib/utils/tokenService";
import type { AuthResponse, LoginRequest, ApiUser } from "@/types/auth";
import axios from "axios";

export async function login(email: string, password: string) {
  // Use real API authentication
  const credentials: LoginRequest = { email, password };
  
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

    // Also save user session for compatibility with existing code
    const compatibleUser = {
      id: user.pk,
      username: user.username || user.email, // Use email as username if not provided
      profilePicture: '', // Default empty, can be updated later
      password: '', // Don't store password
      role: 'user' as const, // Default role
      // Map API user to existing user structure
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    };
    
    saveSession(compatibleUser);
    return compatibleUser;

  } catch (error: unknown) {
    const errorMessage = error && typeof error === 'object' && 'response' in error
      ? (error as { response?: { data?: { detail?: string; message?: string } } }).response?.data?.detail ||
        (error as { response?: { data?: { detail?: string; message?: string } } }).response?.data?.message ||
        'Login failed. Please check your credentials.'
      : 'Login failed. Please check your credentials.';
    throw new Error(errorMessage);
  }
}

export async function getCurrentUser(): Promise<ApiUser> {
  // Real API implementation
  const token = getAccessToken();
  if (!token) {
    throw new Error('No access token available');
  }

  try {
    const response = await axios.get<ApiUser>(
      AUTH_ENDPOINTS.USER_PROFILE,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: unknown) {
    const errorMessage = error && typeof error === 'object' && 'response' in error
      ? (error as { response?: { data?: { detail?: string; message?: string } } }).response?.data?.detail ||
        (error as { response?: { data?: { detail?: string; message?: string } } }).response?.data?.message ||
        'Failed to get user information'
      : 'Failed to get user information';
    throw new Error(errorMessage);
  }
}

export async function updateUsername(newUsername: string): Promise<ApiUser> {
  // Real API implementation
  const token = getAccessToken();
  if (!token) {
    throw new Error('No access token available');
  }

  try {
    const response = await axios.patch<ApiUser>(
      AUTH_ENDPOINTS.UPDATE_PROFILE,
      { username: newUsername },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Update session storage with new username
    const updatedUser = response.data;
    const compatibleUser = {
      id: updatedUser.pk,
      username: updatedUser.username,
      profilePicture: '',
      password: '',
      role: 'user' as const,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
    };
    
    saveSession(compatibleUser);
    return updatedUser;
  } catch (error: unknown) {
    // Handle specific username uniqueness errors
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: { username?: string[] | string; detail?: string; message?: string } } };
      if (axiosError.response?.status === 400) {
        const errorData = axiosError.response.data;
        if (errorData?.username && typeof errorData.username === 'string' && errorData.username.includes('already exists')) {
          throw new Error('Username is already taken. Please choose a different username.');
        }
        if (errorData?.username && Array.isArray(errorData.username)) {
          throw new Error(errorData.username[0] || 'Invalid username format.');
        }
      }
      
      const errorMessage = axiosError.response?.data?.detail || 
                          axiosError.response?.data?.message || 
                          'Failed to update username';
      throw new Error(errorMessage);
    }
    
    throw new Error('Failed to update username');
  }
}

export async function updateUserProfile(profileData: {
  first_name?: string;
  last_name?: string;
  username?: string;
  bio?: string;
}): Promise<ApiUser> {
  // Real API implementation
  const token = getAccessToken();
  if (!token) {
    throw new Error('No access token available');
  }

  try {
    const response = await axios.patch<ApiUser>(
      AUTH_ENDPOINTS.UPDATE_PROFILE,
      profileData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Update session storage with new data
    const updatedUser = response.data;
    const compatibleUser = {
      id: updatedUser.pk,
      username: updatedUser.username,
      profilePicture: '',
      password: '',
      role: 'user' as const,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
    };
    
    saveSession(compatibleUser);
    return updatedUser;
  } catch (error: unknown) {
    // Handle specific validation errors
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: { username?: string[] | string; first_name?: string[]; last_name?: string[]; detail?: string; message?: string } } };
      if (axiosError.response?.status === 400) {
        const errorData = axiosError.response.data;
        
        // Handle username errors
        if (errorData?.username) {
          if (typeof errorData.username === 'string' && errorData.username.includes('already exists')) {
            throw new Error('Username is already taken. Please choose a different username.');
          }
          if (Array.isArray(errorData.username)) {
            throw new Error(errorData.username[0] || 'Invalid username format.');
          }
        }
        
        // Handle first_name errors
        if (errorData?.first_name && Array.isArray(errorData.first_name)) {
          throw new Error(errorData.first_name[0] || 'Invalid first name format.');
        }
        
        // Handle last_name errors
        if (errorData?.last_name && Array.isArray(errorData.last_name)) {
          throw new Error(errorData.last_name[0] || 'Invalid last name format.');
        }
      }
      
      const errorMessage = axiosError.response?.data?.detail || 
                          axiosError.response?.data?.message || 
                          'Failed to update profile';
      throw new Error(errorMessage);
    }
    
    throw new Error('Failed to update profile');
  }
}

export function logout() {
  clearTokenCookies();
  localStorage.removeItem("user");
}
