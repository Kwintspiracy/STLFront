'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { setTokenCookies } from '@/lib/utils/tokenService';
import { AUTH_ENDPOINTS } from '@/lib/api/config';
import axios from 'axios';

export default function DiscordCallbackPage() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshAuth } = useAuth();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    const handleDiscordCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`Discord authentication failed: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received from Discord');
        }

        console.log('🔄 Processing Discord callback with code:', code.substring(0, 10) + '...');

        // Send the code to our backend
        const response = await axios.post(
          AUTH_ENDPOINTS.DISCORD,
          { code },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('✅ Discord authentication successful');

        const { access, refresh, user } = response.data;

        // Store tokens
        setTokenCookies({ access, refresh });

        // Refresh auth context
        refreshAuth();

        showSuccess(`Welcome ${user.first_name || user.email}! You're now logged in with Discord.`);

        // Redirect to home page
        router.push('/');

      } catch (error: any) {
        console.error('❌ Discord authentication failed:', error);
        
        const errorMessage = error.response?.data?.detail || 
                            error.response?.data?.non_field_errors?.[0] ||
                            error.message || 
                            'Discord authentication failed';
        
        setError(errorMessage);
        showError(errorMessage);
        
        // Redirect to login page after a delay
        setTimeout(() => {
          router.push('/auth/signin');
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleDiscordCallback();
  }, [searchParams, router, refreshAuth, showError, showSuccess]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
            Finalisation de la connexion Discord...
          </h2>
          <p className="text-[var(--color-text-secondary)]">
            Veuillez patienter pendant que nous configurons votre compte.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
            Erreur d'authentification Discord
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-4">
            {error}
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">
            Redirection vers la page de connexion...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
          Connexion Discord réussie !
        </h2>
        <p className="text-[var(--color-text-secondary)]">
          Redirection en cours...
        </p>
      </div>
    </div>
  );
}
