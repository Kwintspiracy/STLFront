'use client';

import { useEffect, useState } from 'react';
import { useStudio } from '@/context/StudioContext';
import { notFound } from 'next/navigation';
import type { Studio } from '@/types/studio';

interface Props {
  params: Promise<{ id: string }>;
}

export default function PublicStudioProfile({ params }: Props) {
  const [studioId, setStudioId] = useState<number | null>(null);
  const [studio, setStudio] = useState<Studio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  
  const { getStudio } = useStudio();

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

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    // TODO: Implement actual follow/unfollow API call
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131618] flex items-center justify-center">
        <div className="text-white text-lg">Loading studio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#131618] flex items-center justify-center">
        <div className="text-red-400 text-lg">Error: {error}</div>
      </div>
    );
  }

  if (!studio) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#131618] text-white">
      {/* Studio Header */}
      <div className="bg-[#0F1213] border-b border-[#2A2D30]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Studio Avatar */}
            <div className="flex-shrink-0">
              {studio.badge ? (
                <img
                  src={studio.badge}
                  alt={`${studio.name} logo`}
                  className="w-24 h-24 rounded-lg object-cover border-2 border-[#FDD811]"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gray-600 flex items-center justify-center border-2 border-[#FDD811]">
                  <span className="text-2xl font-bold">{studio.name.charAt(0)}</span>
                </div>
              )}
            </div>

            {/* Studio Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{studio.name}</h1>
              <p className="text-gray-400 mb-2">Founded by {studio.founder}</p>
              <p className="text-gray-400 mb-4">{studio.follower_count} followers</p>
              
              {studio.description && (
                <p className="text-gray-300 max-w-2xl mb-4">{studio.description}</p>
              )}

              {/* Follow Button */}
              <button
                onClick={handleFollowToggle}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isFollowing
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-[#FDD811] text-black hover:bg-[#FDD811]/90'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>

          {/* Studio Banner */}
          {studio.banner && (
            <div className="mt-8 w-full h-64 rounded-lg overflow-hidden">
              <img 
                src={studio.banner} 
                alt={`${studio.name} banner`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Studio Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6 text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Products</h3>
            <p className="text-2xl font-bold text-[#FDD811]">50</p>
          </div>
          
          <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6 text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Downloads</h3>
            <p className="text-2xl font-bold text-[#FDD811]">2,847</p>
          </div>
          
          <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6 text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Rating</h3>
            <p className="text-2xl font-bold text-[#FDD811]">4.8</p>
          </div>
          
          <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6 text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Joined</h3>
            <p className="text-2xl font-bold text-[#FDD811]">
              {new Date(studio.created_at).getFullYear()}
            </p>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-6">Featured Products</h2>
          
          {/* Placeholder for products */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sample Product Cards */}
            <div className="bg-[#131618] border border-[#2A2D30] rounded-lg p-4">
              <div className="w-full h-48 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-400">Product Image</span>
              </div>
              <h3 className="text-white font-medium mb-2">Dragon Miniature Set</h3>
              <p className="text-gray-400 text-sm mb-3">Detailed fantasy dragon miniatures for tabletop gaming</p>
              <div className="flex items-center justify-between">
                <span className="text-[#FDD811] font-bold">$12.99</span>
                <button className="px-4 py-2 bg-[#FDD811] text-black rounded-lg text-sm font-medium hover:bg-[#FDD811]/90 transition-colors">
                  View Details
                </button>
              </div>
            </div>

            <div className="bg-[#131618] border border-[#2A2D30] rounded-lg p-4">
              <div className="w-full h-48 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-400">Product Image</span>
              </div>
              <h3 className="text-white font-medium mb-2">Fantasy Castle</h3>
              <p className="text-gray-400 text-sm mb-3">Modular castle pieces for creating epic battlefields</p>
              <div className="flex items-center justify-between">
                <span className="text-[#FDD811] font-bold">$8.50</span>
                <button className="px-4 py-2 bg-[#FDD811] text-black rounded-lg text-sm font-medium hover:bg-[#FDD811]/90 transition-colors">
                  View Details
                </button>
              </div>
            </div>

            <div className="bg-[#131618] border border-[#2A2D30] rounded-lg p-4">
              <div className="w-full h-48 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-400">Product Image</span>
              </div>
              <h3 className="text-white font-medium mb-2">Sci-Fi Vehicle Pack</h3>
              <p className="text-gray-400 text-sm mb-3">Futuristic vehicles for sci-fi gaming scenarios</p>
              <div className="flex items-center justify-between">
                <span className="text-[#FDD811] font-bold">$15.99</span>
                <button className="px-4 py-2 bg-[#FDD811] text-black rounded-lg text-sm font-medium hover:bg-[#FDD811]/90 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button className="px-6 py-3 bg-[#2A2D30] text-white rounded-lg font-medium hover:bg-[#3A3D40] transition-colors">
              View All Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
