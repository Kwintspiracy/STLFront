'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    <div className="min-h-screen bg-transparent">
      {/* Hero Banner Section */}
      {studio.banner && (
        <div className="relative h-72 md:h-96 overflow-hidden">
          <Image 
            src={studio.banner} 
            alt={`${studio.name} banner`}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Studio Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
              <div className="flex items-end gap-8">
                {studio.badge && (
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-white/30 shadow-2xl flex-shrink-0">
                    <Image 
                      src={studio.badge} 
                      alt={`${studio.name} badge`}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                    <span className="text-primary">{studio.name.split(' ')[0]}</span>
                    <span className="text-white"> {studio.name.split(' ').slice(1).join(' ')}</span>
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <span className="text-white/90 text-sm md:text-base font-medium">
                        Founded by {studio.founder_username || 'Unknown'}
                      </span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <span className="text-white/90 text-sm md:text-base font-medium">
                        {studio.follower_count.toLocaleString()} followers
                      </span>
                    </div>
                  </div>
                  {studio.description && (
                    <p className="text-white/90 max-w-3xl text-base md:text-lg leading-relaxed">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Studio Header (fallback if no banner) */}
        {!studio.banner && (
          <div className="mb-12">
            <div className="flex items-start gap-6 mb-6">
              {studio.badge && (
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <Image 
                    src={studio.badge} 
                    alt={`${studio.name} badge`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-4xl md:text-5xl font-extrabold text-[#F4F4F4] mb-4 leading-tight">
                  <span className="text-primary">{studio.name.split(' ')[0]}</span>
                  <span className="text-white"> {studio.name.split(' ').slice(1).join(' ')}</span>
                </h1>
                <div className="space-y-2 mb-4">
                  <p className="text-[#9ca3af] text-lg">Founded by {studio.founder_username || 'Unknown'}</p>
                  <p className="text-[#9ca3af] text-lg">{studio.follower_count.toLocaleString()} followers</p>
                </div>
                {studio.description && (
                  <p className="text-[#9ca3af] max-w-3xl text-base md:text-lg leading-relaxed">
                    {studio.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div 
            className="rounded-xl p-6 hover:scale-105 transition-transform"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-[#9ca3af]">Total Products</h3>
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <span className="text-blue-400 text-lg">📦</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-primary">50</p>
            <p className="text-xs text-green-400 mt-1">+5 this month</p>
          </div>
          
          <div 
            className="rounded-xl p-6 hover:scale-105 transition-transform"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-[#9ca3af]">Total Sales</h3>
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                <span className="text-green-400 text-lg">💰</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-primary">$4,998</p>
            <p className="text-xs text-green-400 mt-1">+12% from last month</p>
          </div>
          
          <div 
            className="rounded-xl p-6 hover:scale-105 transition-transform"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-[#9ca3af]">Downloads (June)</h3>
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <span className="text-purple-400 text-lg">⬇️</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-primary">1,247</p>
            <p className="text-xs text-green-400 mt-1">+8% from last month</p>
          </div>
          
          <div 
            className="rounded-xl p-6 hover:scale-105 transition-transform"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-[#9ca3af]">Monthly Revenue</h3>
              <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <span className="text-yellow-400 text-lg">📈</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-primary">$470</p>
            <p className="text-xs text-green-400 mt-1">+15% from last month</p>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-8">
          
          {/* Welcome Section */}
          <div 
            className="rounded-xl p-8 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(115, 137, 255, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)' }}
          >
            <h2 className="text-2xl font-extrabold text-[#F4F4F4] mb-3">
              Welcome back to <span className="text-primary">{studio.name}</span>! 👋
            </h2>
            <p className="text-[#9ca3af] mb-6 text-lg">
              Here&apos;s your studio overview and quick actions to manage your content.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href={`/studio/${studioId}/products/add`}
                className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                ➕ Add New Product
              </Link>
              <Link 
                href={`/studio/${studioId}/products`}
                className="bg-white/10 text-[#F4F4F4] px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                📦 Manage Products
              </Link>
              <Link 
                href={`/studio/${studioId}/statistics`}
                className="bg-white/10 text-[#F4F4F4] px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                📊 View Analytics
              </Link>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Left Column - Activity & Performance */}
            <div className="xl:col-span-2 space-y-8">
              
              {/* Recent Activity */}
              <div 
                className="rounded-xl p-6"
                style={{ background: 'rgba(255, 255, 255, 0.04)' }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-extrabold text-[#F4F4F4]">
                    <span className="text-blue-400">RECENT</span>
                    <span className="text-white"> ACTIVITY</span>
                  </h3>
                  <span className="text-xs text-[#9ca3af] bg-white/5 px-3 py-1 rounded-full">Last 24 hours</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                    <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                      <span className="text-green-400 text-lg">✓</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[#F4F4F4] font-medium">New product published</p>
                      <p className="text-[#9ca3af] text-sm">&quot;Dragon Miniature v2&quot; is now live • 2 hours ago</p>
                    </div>
                    <div className="text-green-400 font-semibold text-sm">+1 Product</div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <span className="text-blue-400 text-lg">⬇</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[#F4F4F4] font-medium">Downloads milestone reached</p>
                      <p className="text-[#9ca3af] text-sm">15 new downloads today • 1 hour ago</p>
                    </div>
                    <div className="text-blue-400 font-semibold text-sm">+15 Downloads</div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                      <span className="text-yellow-400 text-lg">💰</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[#F4F4F4] font-medium">Revenue generated</p>
                      <p className="text-[#9ca3af] text-sm">$45 earned from sales • 3 hours ago</p>
                    </div>
                    <div className="text-yellow-400 font-semibold text-sm">+$45</div>
                  </div>
                </div>
              </div>

              {/* Top Products Performance */}
              <div 
                className="rounded-xl p-6"
                style={{ background: 'rgba(255, 255, 255, 0.04)' }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-extrabold text-[#F4F4F4]">
                    <span className="text-yellow-400">TOP</span>
                    <span className="text-white"> PERFORMERS</span>
                  </h3>
                  <Link 
                    href={`/studio/${studioId}/products`}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    View All →
                  </Link>
                </div>
                <div className="space-y-4">
                  {[
                    { name: "Dragon Miniature Pro", downloads: 245, revenue: 189, rank: 1, trend: "+12%" },
                    { name: "Fantasy Castle Set", downloads: 198, revenue: 156, rank: 2, trend: "+8%" },
                    { name: "Warrior Collection", downloads: 167, revenue: 134, rank: 3, trend: "+5%" }
                  ].map((product) => (
                    <div key={product.rank} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-primary font-bold">#{product.rank}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[#F4F4F4] font-medium">{product.name}</p>
                        <p className="text-[#9ca3af] text-sm">{product.downloads} downloads • ${product.revenue} revenue</p>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-semibold text-sm">{product.trend}</div>
                        <div className="text-[#9ca3af] text-xs">vs last month</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Studio Info & Quick Actions */}
            <div className="space-y-8">
              
              {/* Studio Overview */}
              <div 
                className="rounded-xl p-6"
                style={{ background: 'rgba(255, 255, 255, 0.04)' }}
              >
                <h3 className="text-xl font-extrabold text-[#F4F4F4] mb-6">
                  <span className="text-purple-400">STUDIO</span>
                  <span className="text-white"> INFO</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-[#9ca3af] font-medium">Status</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-400 capitalize font-semibold">{studio.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-[#9ca3af] font-medium">Followers</span>
                    <span className="text-[#F4F4F4] font-semibold">{studio.follower_count.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-[#9ca3af] font-medium">Created</span>
                    <span className="text-[#F4F4F4] font-semibold">
                      {new Date(studio.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Earnings Summary */}
              <div 
                className="rounded-xl p-6"
                style={{ background: 'rgba(255, 255, 255, 0.04)' }}
              >
                <h3 className="text-xl font-extrabold text-[#F4F4F4] mb-6">
                  <span className="text-green-400">EARNINGS</span>
                  <span className="text-white"> SUMMARY</span>
                </h3>
                <div className="text-center mb-6">
                  <div 
                    className="p-6 rounded-xl mb-4"
                    style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)' }}
                  >
                    <p className="text-[#9ca3af] text-sm mb-2">Pending Payout</p>
                    <p className="text-3xl font-bold text-green-400">$470</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-[#9ca3af]">Next Payout</p>
                      <p className="text-[#F4F4F4] font-semibold">July 15</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-[#9ca3af]">Total Earned</p>
                      <p className="text-primary font-semibold">$4,998</p>
                    </div>
                  </div>
                </div>
                <Link 
                  href={`/studio/${studioId}/earnings`}
                  className="block w-full text-center bg-green-500 text-black py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  💰 View Detailed Earnings
                </Link>
              </div>

              {/* Quick Actions */}
              <div 
                className="rounded-xl p-6"
                style={{ background: 'rgba(255, 255, 255, 0.04)' }}
              >
                <h3 className="text-xl font-extrabold text-[#F4F4F4] mb-6">
                  <span className="text-orange-400">QUICK</span>
                  <span className="text-white"> ACTIONS</span>
                </h3>
                <div className="space-y-3">
                  <Link 
                    href={`/studio/${studioId}/settings`}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-gray-500/10 rounded-lg flex items-center justify-center group-hover:bg-gray-500/20 transition-colors">
                      <span className="text-gray-400 text-lg">⚙️</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[#F4F4F4] font-medium">Studio Settings</p>
                      <p className="text-[#9ca3af] text-sm">Manage your studio profile</p>
                    </div>
                  </Link>
                  <Link 
                    href={`/public/studio/${studioId}`}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                      <span className="text-green-400 text-lg">👁️</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[#F4F4F4] font-medium">View Public Profile</p>
                      <p className="text-[#9ca3af] text-sm">See how others see your studio</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
