'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WishlistRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new useraccount wishlist page
    router.replace('/useraccount/wishlist');
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-text-muted">Redirecting...</p>
      </div>
    </div>
  );
}
