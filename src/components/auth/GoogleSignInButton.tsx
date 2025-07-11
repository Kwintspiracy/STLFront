'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FaGoogle } from 'react-icons/fa';

interface GoogleSignInButtonProps {
  className?: string;
  disabled?: boolean;
}

export default function GoogleSignInButton({ 
  className = '', 
  disabled = false 
}: GoogleSignInButtonProps) {
  const { loginWithGoogle, isLoading } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (disabled || isLoading || isGoogleLoading) return;

    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      // Note: The redirect will happen, so we won't reach this point
    } catch (error) {
      console.error('Google sign-in error:', error);
      setIsGoogleLoading(false);
    }
  };

  const isButtonDisabled = disabled || isLoading || isGoogleLoading;

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isButtonDisabled}
      className={`
        w-full flex items-center justify-center px-4 py-3 
        border border-[var(--color-border)] rounded-lg 
        bg-white hover:bg-gray-50 
        text-gray-700 font-medium
        transition-all duration-200 
        transform hover:scale-[1.02] active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2
        ${className}
      `}
    >
      {isGoogleLoading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-3"></div>
          Connexion en cours...
        </div>
      ) : (
        <div className="flex items-center">
          <FaGoogle className="h-5 w-5 mr-3 text-red-500" />
          Continuer avec Google
        </div>
      )}
    </button>
  );
}
