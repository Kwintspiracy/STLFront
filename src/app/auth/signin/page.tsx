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
      <main className="w-full h-full flex justify-center items-center bg-[#0F1213]">
        <div className="text-white">Loading...</div>
      </main>
    );
  }

  // If user is authenticated, don't show the form (redirect is happening)
  if (isAuthenticated) {
    return null;
  }

  return (
    <main className="w-full h-full flex justify-center bg-[#0F1213]">
      <LoginForm />
    </main>
  );
}
