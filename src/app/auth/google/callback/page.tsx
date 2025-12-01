'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { AUTH_ENDPOINTS } from '@/lib/api/config';
import { setTokenCookies } from '@/lib/utils/tokenService';
import axios from 'axios';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshAuth } = useAuth();
  const { showError, showSuccess } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Get the authorization code from URL parameters
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`Google authentication error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received from Google');
        }

        console.log('🔄 Processing Google authentication callback...');

        // Send the authorization code directly to our backend
        // The backend will handle the token exchange securely with the client secret
        console.log('🔄 Sending authorization code to backend...');
        const response = await axios.post(AUTH_ENDPOINTS.GOOGLE_LOGIN, {
          code: code,
          callback_url: `${window.location.origin}/auth/google/callback`,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const { access, refresh, user } = response.data;

        // Store tokens in cookies
        setTokenCookies({ access, refresh });

        // Refresh auth context and wait for completion
        await refreshAuth();

        console.log('✅ Google authentication successful');
        showSuccess(`Bienvenue ${user.first_name || user.username || user.email} !`);

        // Redirect to home page
        router.replace('/');

      } catch (error: unknown) {
        console.error('❌ Google authentication failed:', error);

        let errorMessage = "Échec de l'authentification Google";

        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as {
            response?: {
              data?: {
                detail?: string;
                message?: string;
                error?: string;
              };
            };
            message?: string;
          };

          // Log full error details for debugging
          console.error('❌ Google Auth Error Details:', JSON.stringify(axiosError.response?.data, null, 2));

          errorMessage = axiosError.response?.data?.detail ||
            axiosError.response?.data?.message ||
            axiosError.response?.data?.error ||
            axiosError.message ||
            "Échec de l'authentification Google";
        }

        setError(errorMessage);
        showError(errorMessage);

        // Redirect to login page after a delay
        setTimeout(() => {
          router.replace('/auth/signin');
        }, 3000);
      }
    };

    handleGoogleCallback();
  }, [searchParams, router, refreshAuth, showError, showSuccess]);

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-[var(--color-background-card)] border border-[var(--color-border)] rounded-xl p-8 shadow-2xl">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                Erreur d&apos;authentification
              </h1>
              <p className="text-[var(--color-text-secondary)] mb-4">
                {error}
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">
                Redirection vers la page de connexion...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-[var(--color-background-card)] border border-[var(--color-border)] rounded-xl p-8 shadow-2xl">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Authentification en cours
            </h1>
            <p className="text-[var(--color-text-secondary)] mb-6">
              Finalisation de votre connexion avec Google...
            </p>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-[var(--color-background-card)] border border-[var(--color-border)] rounded-xl p-8 shadow-2xl">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Chargement...
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              Préparation de la page d&apos;authentification Google.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
