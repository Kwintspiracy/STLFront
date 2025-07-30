'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { AUTH_ENDPOINTS, USE_MOCK_DATA } from '@/lib/api/config';
import type { RegisterRequest, RegisterResponse } from '@/types/auth';
import axios from 'axios';
import Link from 'next/link';
import { FaEye, FaEyeSlash, FaLock, FaEnvelope, FaCheckCircle, FaUser, FaTimes, FaSpinner } from 'react-icons/fa';
import GoogleSignInButton from './GoogleSignInButton';
import DiscordSignInButton from './DiscordSignInButton';

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Username validation states
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameCheckTimeout, setUsernameCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  // Username validation function
  const validateUsername = (username: string): boolean => {
    // Username must be 3-30 characters, alphanumeric + underscore, no spaces
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username);
  };

  // Check username availability with API
  const checkUsernameAvailability = useCallback(async (username: string) => {
    if (!username || !validateUsername(username)) {
      setUsernameStatus('invalid');
      return;
    }

    setUsernameStatus('checking');

    try {
      if (USE_MOCK_DATA) {
        // Mock check - simulate some usernames as taken
        const takenUsernames = ['admin', 'test', 'user', 'demo'];
        const isTaken = takenUsernames.includes(username.toLowerCase());
        setUsernameStatus(isTaken ? 'taken' : 'available');
      } else {
        // Real API check
        const response = await axios.get(`${AUTH_ENDPOINTS.CHECK_USERNAME}?username=${encodeURIComponent(username)}`);
        setUsernameStatus(response.data.available ? 'available' : 'taken');
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameStatus('invalid');
    }
  }, []);

  // Handle username change with debounced validation
  const handleUsernameChange = (value: string) => {
    setUsername(value);
    
    // Clear previous timeout
    if (usernameCheckTimeout) {
      clearTimeout(usernameCheckTimeout);
    }

    // Reset status if empty
    if (!value) {
      setUsernameStatus('idle');
      return;
    }

    // Check format immediately
    if (!validateUsername(value)) {
      setUsernameStatus('invalid');
      return;
    }

    // Debounce API call
    const timeout = setTimeout(() => {
      checkUsernameAvailability(value);
    }, 500);
    
    setUsernameCheckTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (usernameCheckTimeout) {
        clearTimeout(usernameCheckTimeout);
      }
    };
  }, [usernameCheckTimeout]);

  // Client-side validation
  const validateForm = () => {
    const newErrors: Record<string, string[]> = {};

    if (!username) {
      newErrors.username = ['Username is required'];
    } else if (!validateUsername(username)) {
      newErrors.username = ['Username must be 3-30 characters, letters, numbers and underscore only'];
    } else if (usernameStatus === 'taken') {
      newErrors.username = ['This username is already taken'];
    } else if (usernameStatus === 'checking') {
      newErrors.username = ['Please wait while we check username availability'];
    } else if (usernameStatus !== 'available') {
      newErrors.username = ['Please choose a valid username'];
    }

    if (!email) {
      newErrors.email = ['Email is required'];
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = ['Please enter a valid email address'];
    }

    if (!password1) {
      newErrors.password1 = ['Password is required'];
    } else if (password1.length < 8) {
      newErrors.password1 = ['Password must be at least 8 characters long'];
    }

    if (!password2) {
      newErrors.password2 = ['Please confirm your password'];
    } else if (password1 !== password2) {
      newErrors.password2 = ['Passwords do not match'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password1);
  const strengthColors = ['bg-red-500', 'bg-red-400', 'bg-yellow-500', 'bg-green-400', 'bg-green-500'];
  const strengthLabels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (USE_MOCK_DATA) {
        // Mock registration - simulate success
        showSuccess('Account created successfully! You can now login.');
        router.push('/auth/signin');
      } else {
        // Real API registration
        const credentials: RegisterRequest = { 
          username, 
          email, 
          password1, 
          password2 
        };
        
        const response = await axios.post<RegisterResponse>(
          AUTH_ENDPOINTS.REGISTER,
          credentials,
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );

        showSuccess(response.data.detail || 'Registration successful! Please check your email for verification.');
        router.push('/auth/register/check-email');
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: Record<string, string[]> } };
        if (axiosError.response?.data) {
          // Handle validation errors from API
          const apiErrors = axiosError.response.data;
          setErrors(apiErrors);
          
          // Show first error as toast
          const firstError = Object.values(apiErrors)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            showError(firstError[0]);
          } else if (typeof firstError === 'string') {
            showError(firstError);
          }
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
        showError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-[#F4F4F4]">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="h-5 w-5 text-[#9ca3af]" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              className="w-full pl-10 pr-4 py-3 bg-white/5 rounded-lg text-[#F4F4F4] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email[0]}</p>
          )}
        </div>

        {/* Username Field */}
        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-medium text-[#F4F4F4]">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="h-5 w-5 text-[#9ca3af]" />
            </div>
            <input
              id="username"
              type="text"
              placeholder="your_username"
              className="w-full pl-10 pr-12 py-3 bg-white/5 rounded-lg text-[#F4F4F4] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              required
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_]+"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {usernameStatus === 'checking' && (
                <FaSpinner className="h-5 w-5 text-[#9ca3af] animate-spin" />
              )}
              {usernameStatus === 'available' && (
                <FaCheckCircle className="h-5 w-5 text-green-400" />
              )}
              {usernameStatus === 'taken' && (
                <FaTimes className="h-5 w-5 text-red-400" />
              )}
              {usernameStatus === 'invalid' && username && (
                <FaTimes className="h-5 w-5 text-red-400" />
              )}
            </div>
          </div>
          
          {/* Username validation messages */}
          {username && (
            <div className="text-sm">
              {usernameStatus === 'checking' && (
                <p className="text-[#9ca3af]">Checking availability...</p>
              )}
              {usernameStatus === 'available' && (
                <p className="text-green-400">✓ Username available</p>
              )}
              {usernameStatus === 'taken' && (
                <p className="text-red-400">✗ This username is already taken</p>
              )}
              {usernameStatus === 'invalid' && (
                <p className="text-red-400">✗ 3-30 characters, letters, numbers and _ only</p>
              )}
            </div>
          )}
          
          {!username && (
            <p className="text-xs text-[#9ca3af]">
              3-30 characters, letters, numbers and underscores only
            </p>
          )}
          
          {errors.username && (
            <p className="text-red-400 text-sm mt-1">{errors.username[0]}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password1" className="block text-sm font-medium text-[#F4F4F4]">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="h-5 w-5 text-[#9ca3af]" />
            </div>
            <input
              id="password1"
              type={showPassword1 ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full pl-10 pr-12 py-3 bg-white/5 rounded-lg text-[#F4F4F4] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
              required
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword1(!showPassword1)}
              aria-label={showPassword1 ? "Hide password" : "Show password"}
              aria-pressed={showPassword1}
            >
              {showPassword1 ? (
                <FaEyeSlash className="h-5 w-5 text-[#9ca3af] hover:text-[#F4F4F4] transition-colors" />
              ) : (
                <FaEye className="h-5 w-5 text-[#9ca3af] hover:text-[#F4F4F4] transition-colors" />
              )}
            </button>
          </div>
            
            {/* Password Strength Indicator */}
            {password1 && (
              <div className="space-y-2">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${passwordStrength >= 3 ? 'text-green-400' : passwordStrength >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                  Password strength: {strengthLabels[passwordStrength - 1] || 'Very weak'}
                </p>
              </div>
            )}
            
            {errors.password1 && (
              <p className="text-red-400 text-sm mt-1">{errors.password1[0]}</p>
            )}
          </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label htmlFor="password2" className="block text-sm font-medium text-[#F4F4F4]">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="h-5 w-5 text-[#9ca3af]" />
            </div>
            <input
              id="password2"
              type={showPassword2 ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full pl-10 pr-12 py-3 bg-white/5 rounded-lg text-[#F4F4F4] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword2(!showPassword2)}
            >
              {showPassword2 ? (
                <FaEyeSlash className="h-5 w-5 text-[#9ca3af] hover:text-[#F4F4F4] transition-colors" />
              ) : (
                <FaEye className="h-5 w-5 text-[#9ca3af] hover:text-[#F4F4F4] transition-colors" />
              )}
            </button>
            {password2 && password1 === password2 && (
              <div className="absolute inset-y-0 right-10 flex items-center">
                <FaCheckCircle className="h-5 w-5 text-green-400" />
              </div>
            )}
          </div>
          {errors.password2 && (
            <p className="text-red-400 text-sm mt-1">{errors.password2[0]}</p>
          )}
        </div>

        {/* General Error */}
        {errors.non_field_errors && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-400 text-sm text-center">{errors.non_field_errors[0]}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
              Creating account...
            </div>
          ) : (
            'Create Account'
          )}
        </button>

        {/* Terms */}
        <p className="text-xs text-[#9ca3af] text-center">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:text-primary/80 transition-colors">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:text-primary/80 transition-colors">
            Privacy Policy
          </Link>
        </p>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/20"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 py-1 rounded-md text-[#9ca3af] bg-[#151B23]">
            Or sign up with
          </span>
        </div>
      </div>

      {/* Social Sign In Buttons */}
      <div className="space-y-3">
        <GoogleSignInButton disabled={isLoading} />
        <DiscordSignInButton disabled={isLoading} />
      </div>

      {/* Login Link */}
      <div className="text-center mt-6">
        <p className="text-[#9ca3af] text-sm">
          Already have an account?{' '}
          <Link 
            href="/auth/signin" 
            className="text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
