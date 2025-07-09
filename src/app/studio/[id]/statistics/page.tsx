'use client';

import { useEffect, useState } from 'react';
import { useStudio } from '@/context/StudioContext';
import { useAuth } from '@/context/AuthContext';
import { notFound, useRouter } from 'next/navigation';
import type { Studio } from '@/types/studio';

interface Props {
  params: Promise<{ id: string }>;
}

export default function StudioStatistics({ params }: Props) {
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
      } catch (err: any) {
        console.error('Error loading studio:', err);
        setError(err.message || 'Failed to load studio');
        if (err.message?.includes('404') || err.message?.includes('not found')) {
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
          <h1 className="text-3xl font-bold text-text-primary mb-2">Statistics</h1>
          <p className="text-text-secondary">View detailed analytics for {studio.name}</p>
        </div>

        {/* Statistics Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-text-secondary mb-2">Total Views</h3>
            <p className="text-2xl font-bold text-primary">12,543</p>
            <p className="text-xs text-success mt-1">+15% from last month</p>
          </div>
          
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-text-secondary mb-2">Downloads</h3>
            <p className="text-2xl font-bold text-primary">2,847</p>
            <p className="text-xs text-success mt-1">+8% from last month</p>
          </div>
          
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-text-secondary mb-2">Conversion Rate</h3>
            <p className="text-2xl font-bold text-primary">22.7%</p>
            <p className="text-xs text-error mt-1">-2% from last month</p>
          </div>
          
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-text-secondary mb-2">Avg. Rating</h3>
            <p className="text-2xl font-bold text-primary">4.8</p>
            <p className="text-xs text-success mt-1">+0.2 from last month</p>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-background-secondary border border-border rounded-lg p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">Advanced Statistics Coming Soon</h2>
            <p className="text-text-secondary mb-6">
              We're working on detailed analytics including traffic sources, user demographics, 
              product performance metrics, and more comprehensive reporting tools.
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
