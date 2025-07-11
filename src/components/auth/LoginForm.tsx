'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api/authService';
import { useUser } from '@/context/UserContext';
import { useAuth } from '@/context/AuthContext';
import { USE_MOCK_DATA } from '@/lib/api/config';
import type { User } from '@/data/mock-users';
import Link from 'next/link';
import { FaEye, FaEyeSlash, FaUser, FaLock } from 'react-icons/fa';
import GoogleSignInButton from './GoogleSignInButton';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useUser();
  const auth = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (USE_MOCK_DATA) {
        // Use existing mock authentication
        const user: User = await login(email, password);
        setUser(user); // ✅ met à jour le contexte global
        router.push(user.studio ? `/studio/${user.studio.id}` : '/');
      } else {
        // Use real API authentication via AuthContext
        await auth.login({ email, password });
        // The AuthContext will handle the success toast and state updates
        // Redirect based on user data (for now, just go to home)
        router.replace('/');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Identifiants invalides';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
          Bienvenue
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Connectez-vous à votre compte STL Forge
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
                <FaUser className="h-5 w-5 text-[var(--color-text-muted)]" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="votre@email.com"
                className="w-full pl-10 pr-4 py-3 bg-[var(--color-background-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-primary)]">
              Mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-[var(--color-text-muted)]" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 bg-[var(--color-background-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors" />
                ) : (
                  <FaEye className="h-5 w-5 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm text-center">{error}</p>
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
                Connexion...
              </div>
            ) : (
              'Se connecter'
            )}
          </button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--color-border)]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[var(--color-background-card)] text-[var(--color-text-muted)]">
              Ou continuer avec
            </span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <GoogleSignInButton disabled={isLoading} />
      </div>

      {/* Register Link */}
      <div className="text-center mt-6">
        <p className="text-[var(--color-text-secondary)] text-sm">
          Pas encore de compte ?{' '}
          <Link 
            href="/auth/register" 
            className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-semibold transition-colors"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
