'use client';

import { useEffect, useState } from 'react';
import { useStudio } from '@/context/StudioContext';
import { useAuth } from '@/context/AuthContext';
import { notFound, useRouter } from 'next/navigation';
import type { Studio } from '@/types/studio';

interface Props {
  params: Promise<{ id: string }>;
}

export default function StudioDashboard({ params }: Props) {
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
        <div className="text-error text-lg">Error: {error}</div>
      </div>
    );
  }

  if (!studio) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Studio Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {studio.badge && (
              <img 
                src={studio.badge} 
                alt={`${studio.name} badge`}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-text-primary">{studio.name}</h1>
              <p className="text-text-secondary">Founded by {studio.founder}</p>
              <p className="text-text-secondary">{studio.follower_count} followers</p>
            </div>
          </div>
          
          {studio.description && (
            <p className="text-text-secondary max-w-2xl">{studio.description}</p>
          )}
          
          {studio.banner && (
            <div className="mt-6 w-full h-48 rounded-lg overflow-hidden">
              <img 
                src={studio.banner} 
                alt={`${studio.name} banner`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-text-secondary mb-2">Total Products</h3>
            <p className="text-2xl font-bold text-accent">50</p>
          </div>
          
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-text-secondary mb-2">Total Sales</h3>
            <p className="text-2xl font-bold text-accent">$4,998</p>
          </div>
          
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-text-secondary mb-2">Products Sold (June)</h3>
            <p className="text-2xl font-bold text-accent">90</p>
          </div>
          
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-text-secondary mb-2">Monthly Revenue</h3>
            <p className="text-2xl font-bold text-accent">$470</p>
          </div>
        </div>

        {/* Studio Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-background-secondary border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Studio Dashboard</h2>
              <p className="text-text-secondary">Welcome to {studio.name}!</p>
              
              {/* Placeholder for future content */}
              <div className="mt-6 space-y-4">
                <div className="bg-background border border-border rounded-lg p-4">
                  <h3 className="text-lg font-medium text-text-primary mb-2">Recent Activity</h3>
                  <p className="text-text-secondary text-sm">No recent activity</p>
                </div>
                
                <div className="bg-background border border-border rounded-lg p-4">
                  <h3 className="text-lg font-medium text-text-primary mb-2">Products</h3>
                  <p className="text-text-secondary text-sm">No products yet</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-background-secondary border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Studio Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-text-secondary">Status:</span>
                  <span className="text-text-primary ml-2 capitalize">{studio.status}</span>
                </div>
                <div>
                  <span className="text-text-secondary">Created:</span>
                  <span className="text-text-primary ml-2">
                    {new Date(studio.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary">Updated:</span>
                  <span className="text-text-primary ml-2">
                    {new Date(studio.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-background-secondary border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Payout Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-text-secondary">Pending Payout:</span>
                  <span className="text-accent ml-2 font-medium">$470</span>
                </div>
                <div>
                  <span className="text-text-secondary">Next Payout:</span>
                  <span className="text-text-primary ml-2">July 15, 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
