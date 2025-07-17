'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { AUTH_ENDPOINTS, USE_MOCK_DATA } from '@/lib/api/config';
import type { RegisterRequest, RegisterResponse } from '@/types/auth';
import axios from 'axios';
import Link from 'next/link';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import GoogleSignInButton from './GoogleSignInButton';
import DiscordSignInButton from './DiscordSignInButton';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  // Client-side validation
  const validateForm = () => {
    const newErrors: Record<string, string[]> = {};

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
  const strengthLabels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];

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
        const credentials: RegisterRequest = { email, password1, password2 };
        
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
    } catch (error: any) {
      if (error.response?.data) {
        // Handle validation errors from API
        const apiErrors = error.response.data;
        setErrors(apiErrors);
        
        // Show first error as toast
        const firstError = Object.values(apiErrors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          showError(firstError[0]);
        } else if (typeof firstError === 'string') {
          showError(firstError);
        }
      } else {
        const errorMessage = error.message || 'Registration failed. Please try again.';
        showError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
          Rejoignez STL Forge
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Créez votre compte et commencez à partager vos créations
        </p>
      </div>

      {/* Form */}
      <div className="bg-[var(--color-background-card)] border border-[var(--color-border)] rounded-xl p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-primary)]">
              Adresse email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-[var(--color-text-muted)]" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="votre@email.com"
                className={`w-full pl-10 pr-4 py-3 bg-[var(--color-background-secondary)] border rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 ${
                  errors.email ? 'border-red-500' : 'border-[var(--color-border)]'
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email[0]}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password1" className="block text-sm font-medium text-[var(--color-text-primary)]">
              Mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-[var(--color-text-muted)]" />
              </div>
              <input
                id="password1"
                type={showPassword1 ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full pl-10 pr-12 py-3 bg-[var(--color-background-secondary)] border rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 ${
                  errors.password1 ? 'border-red-500' : 'border-[var(--color-border)]'
                }`}
                value={password1}
                onChange={(e) => setPassword1(e.target.value)}
                required
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword1(!showPassword1)}
                aria-label={showPassword1 ? "Masquer le mot de passe" : "Révéler le mot de passe"}
                aria-pressed={showPassword1}
              >
                {showPassword1 ? (
                  <FaEyeSlash className="h-5 w-5 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors" />
                ) : (
                  <FaEye className="h-5 w-5 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors" />
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
                  Force du mot de passe: {strengthLabels[passwordStrength - 1] || 'Très faible'}
                </p>
              </div>
            )}
            
            {errors.password1 && (
              <p className="text-red-400 text-sm mt-1">{errors.password1[0]}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="password2" className="block text-sm font-medium text-[var(--color-text-primary)]">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-[var(--color-text-muted)]" />
              </div>
              <input
                id="password2"
                type={showPassword2 ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full pl-10 pr-12 py-3 bg-[var(--color-background-secondary)] border rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 ${
                  errors.password2 ? 'border-red-500' : 'border-[var(--color-border)]'
                }`}
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
                  <FaEyeSlash className="h-5 w-5 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors" />
                ) : (
                  <FaEye className="h-5 w-5 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors" />
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
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-primary-foreground)] font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--color-primary-foreground)] mr-2"></div>
                Création...
              </div>
            ) : (
              'Créer le compte'
            )}
          </button>

          {/* Terms */}
          <p className="text-xs text-[var(--color-text-muted)] text-center">
            En créant un compte, vous acceptez nos{' '}
            <Link href="/terms" className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">
              Conditions d'utilisation
            </Link>{' '}
            et notre{' '}
            <Link href="/privacy" className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">
              Politique de confidentialité
            </Link>
          </p>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--color-border)]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[var(--color-background-card)] text-[var(--color-text-muted)]">
              Ou créer un compte avec
            </span>
          </div>
        </div>

        {/* Social Sign In Buttons */}
        <div className="space-y-3">
          <GoogleSignInButton disabled={isLoading} />
          <DiscordSignInButton disabled={isLoading} />
        </div>
      </div>

      {/* Login Link */}
      <div className="text-center mt-6">
        <p className="text-[var(--color-text-secondary)] text-sm">
          Déjà un compte ?{' '}
          <Link 
            href="/auth/signin" 
            className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-semibold transition-colors"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
