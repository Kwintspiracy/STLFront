// services/authService.ts
import { saveSession } from "@/lib/utils/sessionService";
import { USE_MOCK_DATA, AUTH_ENDPOINTS } from "./config";
import { setTokenCookies, clearTokenCookies, getAccessToken } from "@/lib/utils/tokenService";
import { mockUsers } from "@/data/mock-users";
import type { AuthResponse, LoginRequest, ApiUser } from "@/types/auth";
import axios from "axios";

export async function login(email: string, password: string) {
  if (USE_MOCK_DATA) {
    // Use mock authentication - find by email instead of username
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (!user) throw new Error("Invalid email or password");
    saveSession(user);
    return user;
  } else {
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
}

export async function getCurrentUser(): Promise<ApiUser> {
  if (USE_MOCK_DATA) {
    // Mock implementation - return a user with studio info
    const mockUser = mockUsers[0]; // Use first mock user
    return {
      pk: mockUser.id,
      email: mockUser.email || '',
      first_name: mockUser.firstName || '',
      last_name: mockUser.lastName || '',
      username: mockUser.username || mockUser.email || '',
      role: 'owner',
      studio: {
        id: 1,
        name: 'Mock Studio'
      }
    };
  } else {
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
}

export async function updateUsername(newUsername: string): Promise<ApiUser> {
  if (USE_MOCK_DATA) {
    // Mock implementation - check uniqueness first
    const currentUser = mockUsers[0];
    
    // Check if username is already taken by another user
    const existingUser = mockUsers.find(user => 
      user.username === newUsername && user.id !== currentUser.id
    );
    
    if (existingUser) {
      throw new Error('Username is already taken. Please choose a different username.');
    }
    
    // Update the mock user
    currentUser.username = newUsername;
    
    // Update session storage
    const updatedUser = {
      ...currentUser,
      username: newUsername
    };
    saveSession(updatedUser);
    
    return {
      pk: currentUser.id,
      email: currentUser.email || '',
      first_name: currentUser.firstName || '',
      last_name: currentUser.lastName || '',
      username: newUsername,
      role: 'owner',
      studio: {
        id: 1,
        name: 'Mock Studio'
      }
    };
  } else {
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
}

export async function updateUserProfile(profileData: {
  first_name?: string;
  last_name?: string;
  username?: string;
  bio?: string;
}): Promise<ApiUser> {
  if (USE_MOCK_DATA) {
    // Mock implementation
    const currentUser = mockUsers[0];
    
    // Check if username is already taken by another user (if username is being updated)
    if (profileData.username && profileData.username !== currentUser.username) {
      const existingUser = mockUsers.find(user => 
        user.username === profileData.username && user.id !== currentUser.id
      );
      
      if (existingUser) {
        throw new Error('Username is already taken. Please choose a different username.');
      }
    }
    
    // Update the mock user
    if (profileData.first_name !== undefined) currentUser.firstName = profileData.first_name;
    if (profileData.last_name !== undefined) currentUser.lastName = profileData.last_name;
    if (profileData.username !== undefined) currentUser.username = profileData.username;
    // Note: bio is not in mock user structure, but we'll handle it in the API response
    
    // Update session storage
    const updatedUser = {
      ...currentUser,
      firstName: profileData.first_name || currentUser.firstName,
      lastName: profileData.last_name || currentUser.lastName,
      username: profileData.username || currentUser.username
    };
    saveSession(updatedUser);
    
    return {
      pk: currentUser.id,
      email: currentUser.email || '',
      first_name: profileData.first_name || currentUser.firstName || '',
      last_name: profileData.last_name || currentUser.lastName || '',
      username: profileData.username || currentUser.username || '',
      role: 'owner',
      studio: {
        id: 1,
        name: 'Mock Studio'
      }
    };
  } else {
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
}

export function logout() {
  if (USE_MOCK_DATA) {
    localStorage.removeItem("user");
  } else {
    clearTokenCookies();
    localStorage.removeItem("user");
  }
}
