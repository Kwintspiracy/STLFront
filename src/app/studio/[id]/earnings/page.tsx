'use client';

import { useEffect, useState } from 'react';
import { useStudio } from '@/context/StudioContext';
import { useAuth } from '@/context/AuthContext';
import { notFound, useRouter } from 'next/navigation';
import type { Studio } from '@/types/studio';

interface Props {
  params: Promise<{ id: string }>;
}

export default function StudioEarnings({ params }: Props) {
  const [studioId, setStudioId] = useState<number | null>(null);
  const [studio, setStudio] = useState<Studio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { getStudio } = useStudio();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Resolve params
  useEffect(() => {
    params.then(resolvedParams => {
      const id = parseInt(resolvedParams.id, 10);
      setStudioId(id);
    });
  }, [params]);

  // Load studio data
  useEffect(() => {
    if (!studioId) return;

    const loadStudio = async () => {
      try {
        setLoading(true);
        setError(null);
        const studioData = await getStudio(studioId);
        setStudio(studioData);
      } catch (err: unknown) {
        console.error('Error loading studio:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load studio';
        setError(errorMessage);
        if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          notFound();
        }
      } finally {
        setLoading(false);
      }
    };

    loadStudio();
  }, [studioId, getStudio]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-primary text-lg">Loading studio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-red-400 text-lg">Error: {error}</div>
      </div>
    );
  }

  if (!studio) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Earnings</h1>
          <p className="text-text-secondary">Track your revenue and payouts for {studio.name}</p>
        </div>

        {/* Earnings Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-text-secondary mb-2">Total Earnings</h3>
            <p className="text-2xl font-bold text-primary">$4,998</p>
            <p className="text-xs text-success mt-1">+12% from last month</p>
          </div>
          
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-text-secondary mb-2">This Month</h3>
            <p className="text-2xl font-bold text-primary">$470</p>
            <p className="text-xs text-success mt-1">+8% from last month</p>
          </div>
          
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-text-secondary mb-2">Pending Payout</h3>
            <p className="text-2xl font-bold text-primary">$470</p>
            <p className="text-xs text-text-secondary mt-1">Next payout: July 15</p>
          </div>
          
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-text-secondary mb-2">Avg. Per Sale</h3>
            <p className="text-2xl font-bold text-primary">$5.22</p>
            <p className="text-xs text-success mt-1">+3% from last month</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-background-secondary border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Recent Transactions</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
              <div>
                <p className="text-text-primary font-medium">Dragon Miniature Set</p>
                <p className="text-sm text-text-secondary">June 28, 2025</p>
              </div>
              <div className="text-right">
                <p className="text-primary font-medium">+$12.99</p>
                <p className="text-xs text-text-secondary">Completed</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
              <div>
                <p className="text-text-primary font-medium">Fantasy Castle</p>
                <p className="text-sm text-text-secondary">June 27, 2025</p>
              </div>
              <div className="text-right">
                <p className="text-primary font-medium">+$8.50</p>
                <p className="text-xs text-text-secondary">Completed</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
              <div>
                <p className="text-text-primary font-medium">Sci-Fi Vehicle Pack</p>
                <p className="text-sm text-text-secondary">June 26, 2025</p>
              </div>
              <div className="text-right">
                <p className="text-primary font-medium">+$15.99</p>
                <p className="text-xs text-text-secondary">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-background-secondary border border-border rounded-lg p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">Advanced Earnings Features Coming Soon</h2>
            <p className="text-text-secondary mb-6">
              We&apos;re working on detailed earnings reports, tax documents, payment method management,
              and automated payout scheduling.
            </p>
            <div className="text-sm text-text-muted">
              Expected release: Q3 2025
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
