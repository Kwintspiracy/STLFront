'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { AUTH_ENDPOINTS, USE_MOCK_DATA } from '@/lib/api/config';
import type { RegisterRequest, RegisterResponse } from '@/types/auth';
import axios from 'axios';
import Link from 'next/link';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
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
    <div className='w-xl'>
      <form onSubmit={handleSubmit} className="mt-24 p-6 bg-neutral-900 border border-neutral-700 rounded space-y-4">
        <h1 className="text-xl font-bold text-white text-center">Créer un compte</h1>

        <div>
          <input
            type="email"
            placeholder="Adresse email"
            className={`w-full p-2 bg-neutral-800 border rounded text-white ${
              errors.email ? 'border-red-500' : 'border-neutral-600'
            }`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Mot de passe"
            className={`w-full p-2 bg-neutral-800 border rounded text-white ${
              errors.password1 ? 'border-red-500' : 'border-neutral-600'
            }`}
            value={password1}
            onChange={(e) => setPassword1(e.target.value)}
            required
          />
          {errors.password1 && (
            <p className="text-red-500 text-sm mt-1">{errors.password1[0]}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            className={`w-full p-2 bg-neutral-800 border rounded text-white ${
              errors.password2 ? 'border-red-500' : 'border-neutral-600'
            }`}
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />
          {errors.password2 && (
            <p className="text-red-500 text-sm mt-1">{errors.password2[0]}</p>
          )}
        </div>

        {errors.non_field_errors && (
          <p className="text-red-500 text-sm text-center">{errors.non_field_errors[0]}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white p-2 rounded transition-colors"
        >
          {isLoading ? 'Création...' : 'Créer le compte'}
        </button>

        <div className="text-center">
          <p className="text-neutral-400 text-sm">
            Déjà un compte ?{' '}
            <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300">
              Se connecter
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
