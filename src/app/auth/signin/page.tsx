'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/auth/LoginForm';

export default function SignInPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  // If user is authenticated, don't show the form (redirect is happening)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="max-w-md mx-auto mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
            <span className="text-primary">SIGN</span>
            <span className="text-white"> IN</span>
          </h1>
          <p className="text-[#9ca3af] text-base sm:text-lg">
            Enter your credentials to continue
          </p>
        </div>

        {/* Login Form Section */}
        <div className="max-w-md mx-auto">
          <div 
            className="rounded-xl p-6 sm:p-8"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          >
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
