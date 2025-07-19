'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { AUTH_ENDPOINTS, USE_MOCK_DATA } from '@/lib/api/config';
import type { EmailConfirmResponse } from '@/types/auth';
import axios from 'axios';
import Link from 'next/link';

export default function EmailConfirmPage() {
  const params = useParams();
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const key = params.key as string;

  const confirmEmail = async () => {
    try {
      if (USE_MOCK_DATA) {
        // Mock email confirmation - always succeed
        setStatus('success');
        setMessage('Email confirmed successfully! You can now login.');
        showSuccess('Email confirmed successfully!');
        return;
      }

      // Real API email confirmation
      const response = await axios.get<EmailConfirmResponse>(
        `${AUTH_ENDPOINTS.EMAIL_CONFIRM}${key}/`,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      setStatus('success');
      setMessage(response.data.detail || 'Email confirmed successfully!');
      showSuccess('Email confirmed successfully!');

    } catch (error: unknown) {
      setStatus('error');
      
      let errorMessage = 'Email confirmation failed. The link may be invalid or expired.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: {
              detail?: string;
            };
          };
        };
        
        if (axiosError.response?.data?.detail) {
          errorMessage = axiosError.response.data.detail;
        }
      }
      
      setMessage(errorMessage);
      showError(errorMessage);
    }
  };

  useEffect(() => {
    if (!key) {
      setStatus('error');
      setMessage('Invalid confirmation link.');
      return;
    }

    confirmEmail();
  }, [key, confirmEmail]);

  const handleLoginRedirect = () => {
    router.push('/auth/signin');
  };

  return (
    <div className="min-h-screen bg-[#131618] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mt-24 p-6 bg-neutral-900 border border-neutral-700 rounded space-y-4 text-center">
          
          {status === 'loading' && (
            <>
              <div className="text-6xl mb-4">⏳</div>
              <h1 className="text-xl font-bold text-white">Confirmation en cours...</h1>
              <p className="text-neutral-300 text-sm">
                Vérification de votre adresse email...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-xl font-bold text-white">Email confirmé !</h1>
              <p className="text-neutral-300 text-sm">
                {message}
              </p>
              <button
                onClick={handleLoginRedirect}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors"
              >
                Se connecter maintenant
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-xl font-bold text-white">Erreur de confirmation</h1>
              <p className="text-red-400 text-sm">
                {message}
              </p>
              <div className="space-y-2">
                <button
                  onClick={confirmEmail}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded transition-colors"
                >
                  Réessayer
                </button>
                <Link 
                  href="/auth/register" 
                  className="block w-full bg-neutral-600 hover:bg-neutral-700 text-white p-2 rounded transition-colors"
                >
                  Créer un nouveau compte
                </Link>
              </div>
            </>
          )}

          <div className="pt-4">
            <Link 
              href="/auth/signin" 
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
