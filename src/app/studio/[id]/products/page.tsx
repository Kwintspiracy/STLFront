'use client';

import { useEffect, useState } from 'react';
import { useStudio } from '@/context/StudioContext';
import { useAuth } from '@/context/AuthContext';
import { notFound, useRouter } from 'next/navigation';
import type { Studio } from '@/types/studio';

interface Props {
  params: Promise<{ id: string }>;
}

export default function StudioProducts({ params }: Props) {
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
    <div className="min-h-screen bg-[#131618]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
            <p className="text-gray-400">Manage your products for {studio.name}</p>
          </div>
          <button className="px-6 py-3 bg-[#FDD811] text-black rounded-lg font-medium hover:bg-[#FDD811]/90 transition-colors">
            Add New Product
          </button>
        </div>

        {/* Products Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Total Products</h3>
            <p className="text-2xl font-bold text-[#FDD811]">50</p>
          </div>
          
          <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Published</h3>
            <p className="text-2xl font-bold text-[#FDD811]">47</p>
          </div>
          
          <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Draft</h3>
            <p className="text-2xl font-bold text-[#FDD811]">3</p>
          </div>
          
          <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Total Downloads</h3>
            <p className="text-2xl font-bold text-[#FDD811]">2,847</p>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Your Products</h2>
            <div className="flex items-center space-x-4">
              <select className="bg-[#131618] border border-[#2A2D30] text-white rounded-lg px-3 py-2 text-sm">
                <option>All Products</option>
                <option>Published</option>
                <option>Draft</option>
              </select>
              <input
                type="text"
                placeholder="Search products..."
                className="bg-[#131618] border border-[#2A2D30] text-white rounded-lg px-3 py-2 text-sm w-64"
              />
            </div>
          </div>

          {/* Sample Products */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#131618] border border-[#2A2D30] rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">IMG</span>
                </div>
                <div>
                  <h3 className="text-white font-medium">Dragon Miniature Set</h3>
                  <p className="text-gray-400 text-sm">Fantasy • Created 2 weeks ago</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-green-400">Published</span>
                    <span className="text-xs text-gray-400">156 downloads</span>
                    <span className="text-xs text-[#FDD811]">$12.99</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm text-gray-300 hover:text-white transition-colors">
                  Edit
                </button>
                <button className="px-3 py-1 text-sm text-gray-300 hover:text-white transition-colors">
                  View
                </button>
                <button className="px-3 py-1 text-sm text-red-400 hover:text-red-300 transition-colors">
                  Delete
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#131618] border border-[#2A2D30] rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">IMG</span>
                </div>
                <div>
                  <h3 className="text-white font-medium">Fantasy Castle</h3>
                  <p className="text-gray-400 text-sm">Architecture • Created 1 month ago</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-green-400">Published</span>
                    <span className="text-xs text-gray-400">89 downloads</span>
                    <span className="text-xs text-[#FDD811]">$8.50</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm text-gray-300 hover:text-white transition-colors">
                  Edit
                </button>
                <button className="px-3 py-1 text-sm text-gray-300 hover:text-white transition-colors">
                  View
                </button>
                <button className="px-3 py-1 text-sm text-red-400 hover:text-red-300 transition-colors">
                  Delete
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#131618] border border-[#2A2D30] rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">IMG</span>
                </div>
                <div>
                  <h3 className="text-white font-medium">Sci-Fi Vehicle Pack</h3>
                  <p className="text-gray-400 text-sm">Vehicles • Created 3 weeks ago</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-yellow-400">Draft</span>
                    <span className="text-xs text-gray-400">0 downloads</span>
                    <span className="text-xs text-[#FDD811]">$15.99</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm text-gray-300 hover:text-white transition-colors">
                  Edit
                </button>
                <button className="px-3 py-1 text-sm text-[#FDD811] hover:text-[#FDD811]/80 transition-colors">
                  Publish
                </button>
                <button className="px-3 py-1 text-sm text-red-400 hover:text-red-300 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#2A2D30]">
            <p className="text-sm text-gray-400">Showing 1-3 of 50 products</p>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors">
                Previous
              </button>
              <button className="px-3 py-1 text-sm bg-[#FDD811] text-black rounded">
                1
              </button>
              <button className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors">
                2
              </button>
              <button className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors">
                3
              </button>
              <button className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
