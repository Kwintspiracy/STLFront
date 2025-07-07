'use client';

import { useEffect, useState } from 'react';
import { useStudio } from '@/context/StudioContext';
import { useAuth } from '@/context/AuthContext';
import { notFound, useRouter } from 'next/navigation';
import type { Studio } from '@/types/studio';

interface Props {
  params: Promise<{ id: string }>;
}

export default function StudioInbox({ params }: Props) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Inbox</h1>
          <p className="text-gray-400">Manage messages and communications for {studio.name}</p>
        </div>

        {/* Inbox Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Unread Messages</h3>
            <p className="text-2xl font-bold text-[#FDD811]">3</p>
          </div>
          
          <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Total Messages</h3>
            <p className="text-2xl font-bold text-[#FDD811]">47</p>
          </div>
          
          <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Response Rate</h3>
            <p className="text-2xl font-bold text-[#FDD811]">98%</p>
          </div>
        </div>

        {/* Sample Messages */}
        <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Messages</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-[#131618] border border-[#2A2D30] rounded-lg">
              <div className="w-10 h-10 bg-[#FDD811] rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">JD</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium">John Doe</h3>
                  <span className="text-xs text-gray-400">2 hours ago</span>
                </div>
                <p className="text-gray-300 text-sm mb-2">
                  Hi! I love your Dragon Miniature Set. Do you have any plans to create more fantasy creatures?
                </p>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#FDD811]/10 text-[#FDD811]">
                    Unread
                  </span>
                  <span className="text-xs text-gray-400">Product Inquiry</span>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-[#131618] border border-[#2A2D30] rounded-lg">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium">Sarah Miller</h3>
                  <span className="text-xs text-gray-400">1 day ago</span>
                </div>
                <p className="text-gray-300 text-sm mb-2">
                  Thank you for the quick response! The custom modifications look perfect.
                </p>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-600 text-gray-300">
                    Read
                  </span>
                  <span className="text-xs text-gray-400">Custom Request</span>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-[#131618] border border-[#2A2D30] rounded-lg">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">MJ</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium">Mike Johnson</h3>
                  <span className="text-xs text-gray-400">3 days ago</span>
                </div>
                <p className="text-gray-300 text-sm mb-2">
                  Great work on the Sci-Fi Vehicle Pack! Could you create a tutorial on painting techniques?
                </p>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#FDD811]/10 text-[#FDD811]">
                    Unread
                  </span>
                  <span className="text-xs text-gray-400">Feedback</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-[#FDD811]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#FDD811]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Full Messaging System Coming Soon</h2>
            <p className="text-gray-400 mb-6">
              We're building a complete messaging system with real-time chat, file attachments, 
              message threading, and automated responses.
            </p>
            <div className="text-sm text-gray-500">
              Expected release: Q4 2025
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
