// services/authService.ts
import { findUserByCredentials } from "@/lib/api/userRepository";
import { saveSession } from "@/lib/utils/sessionService";
import { USE_MOCK_DATA, AUTH_ENDPOINTS } from "./config";
import { setTokenCookies, clearTokenCookies } from "@/lib/utils/tokenService";
import { mockUsers, type User } from "@/data/mock-users";
import type { AuthResponse, LoginRequest } from "@/types/auth";
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

      const { access_token, refresh_token, user } = response.data;

      // Store tokens in cookies
      setTokenCookies({ access: access_token, refresh: refresh_token });

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

    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
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
