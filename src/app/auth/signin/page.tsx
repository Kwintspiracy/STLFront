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
    <div className="min-h-screen bg-[var(--color-background)] px-4 py-12">
      <div className="w-full max-w-md mx-auto pt-16">
        <LoginForm />
      </div>
    </div>
  );
}
