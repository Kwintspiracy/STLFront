'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
      } catch (err: unknown) {
        console.error('Error loading studio:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load studio';
        setError(errorMessage);
        if (errorMessage?.includes('404') || errorMessage?.includes('not found')) {
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
      {/* Hero Banner Section */}
      {studio.banner && (
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img 
            src={studio.banner} 
            alt={`${studio.name} banner`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Studio Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
              <div className="flex items-end gap-6">
                {studio.badge && (
                  <img 
                    src={studio.badge} 
                    alt={`${studio.name} badge`}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover border-4 border-white/20 shadow-2xl"
                  />
                )}
                <div className="flex-1 text-white">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{studio.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      Founded by {studio.founder_username || 'Unknown'}
                    </span>
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      {studio.follower_count} followers
                    </span>
                  </div>
                  {studio.description && (
                    <p className="mt-3 text-white/90 max-w-2xl text-sm md:text-base">
                      {studio.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Studio Header (fallback if no banner) */}
        {!studio.banner && (
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
                <p className="text-text-secondary">Founded by {studio.founder_username || 'Unknown'}</p>
                <p className="text-text-secondary">{studio.follower_count} followers</p>
              </div>
            </div>
            
            {studio.description && (
              <p className="text-text-secondary max-w-2xl">{studio.description}</p>
            )}
          </div>
        )}

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-background-secondary border border-border rounded-lg p-6 hover:border-primary/20 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-secondary">Total Products</h3>
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <span className="text-blue-400 text-lg">📦</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-primary">50</p>
            <p className="text-xs text-green-400 mt-1">+5 this month</p>
          </div>
          
          <div className="bg-background-secondary border border-border rounded-lg p-6 hover:border-primary/20 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-secondary">Total Sales</h3>
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                <span className="text-green-400 text-lg">💰</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-primary">$4,998</p>
            <p className="text-xs text-green-400 mt-1">+12% from last month</p>
          </div>
          
          <div className="bg-background-secondary border border-border rounded-lg p-6 hover:border-primary/20 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-secondary">Downloads (June)</h3>
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <span className="text-purple-400 text-lg">⬇️</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-primary">1,247</p>
            <p className="text-xs text-green-400 mt-1">+8% from last month</p>
          </div>
          
          <div className="bg-background-secondary border border-border rounded-lg p-6 hover:border-primary/20 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-secondary">Monthly Revenue</h3>
              <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <span className="text-yellow-400 text-lg">📈</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-primary">$470</p>
            <p className="text-xs text-green-400 mt-1">+15% from last month</p>
          </div>
        </div>

        {/* Studio Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Welcome back to {studio.name}! 👋
              </h2>
              <p className="text-text-secondary mb-4">
                Here&apos;s what&apos;s happening with your studio today.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link 
                  href={`/studio/${studioId}/products/add`}
                  className="bg-primary text-black px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
                >
                  Add New Product
                </Link>
                <Link 
                  href={`/studio/${studioId}/statistics`}
                  className="bg-background-secondary border border-border text-text-primary px-4 py-2 rounded-lg font-medium hover:border-primary/20 transition-colors text-sm"
                >
                  View Analytics
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-background-secondary border border-border rounded-lg p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                    <span className="text-green-400 text-sm">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-text-primary text-sm">New product &quot;Dragon Miniature&quot; published</p>
                    <p className="text-text-secondary text-xs">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <span className="text-blue-400 text-sm">⬇</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-text-primary text-sm">15 new downloads today</p>
                    <p className="text-text-secondary text-xs">1 hour ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <div className="w-8 h-8 bg-yellow-500/10 rounded-full flex items-center justify-center">
                    <span className="text-yellow-400 text-sm">💰</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-text-primary text-sm">$45 earned from sales</p>
                    <p className="text-text-secondary text-xs">3 hours ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-background-secondary border border-border rounded-lg p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Top Performing Products</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-xs">IMG</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-text-primary text-sm font-medium">Product Name {i}</p>
                      <p className="text-text-secondary text-xs">125 downloads • $89 revenue</p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary text-sm font-medium">#{i}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-background-secondary border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Studio Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Status:</span>
                  <span className="text-green-400 capitalize font-medium">{studio.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Created:</span>
                  <span className="text-text-primary">
                    {new Date(studio.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Updated:</span>
                  <span className="text-text-primary">
                    {new Date(studio.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-background-secondary border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Earnings</h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-green-500/10 rounded-lg">
                  <p className="text-text-secondary text-sm">Pending Payout</p>
                  <p className="text-2xl font-bold text-primary">$470</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Next Payout:</span>
                    <span className="text-text-primary">July 15, 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Total Earned:</span>
                    <span className="text-primary font-medium">$4,998</span>
                  </div>
                </div>
                <Link 
                  href={`/studio/${studioId}/earnings`}
                  className="block w-full text-center bg-primary text-black py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
                >
                  View Earnings
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-background-secondary border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  href={`/studio/${studioId}/products`}
                  className="flex items-center gap-3 p-3 bg-background rounded-lg hover:border-primary/20 border border-transparent transition-colors"
                >
                  <span className="text-blue-400">📦</span>
                  <span className="text-text-primary text-sm">Manage Products</span>
                </Link>
                <Link 
                  href={`/studio/${studioId}/settings`}
                  className="flex items-center gap-3 p-3 bg-background rounded-lg hover:border-primary/20 border border-transparent transition-colors"
                >
                  <span className="text-gray-400">⚙️</span>
                  <span className="text-text-primary text-sm">Studio Settings</span>
                </Link>
                <Link 
                  href={`/public/studio/${studioId}`}
                  className="flex items-center gap-3 p-3 bg-background rounded-lg hover:border-primary/20 border border-transparent transition-colors"
                >
                  <span className="text-green-400">👁️</span>
                  <span className="text-text-primary text-sm">View Public Profile</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
