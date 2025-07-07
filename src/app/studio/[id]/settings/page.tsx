'use client';

import { useEffect, useState } from 'react';
import { useStudio } from '@/context/StudioContext';
import { useAuth } from '@/context/AuthContext';
import { notFound, useRouter } from 'next/navigation';
import type { Studio } from '@/types/studio';

interface Props {
  params: Promise<{ id: string }>;
}

export default function StudioSettings({ params }: Props) {
  const [studioId, setStudioId] = useState<number | null>(null);
  const [studio, setStudio] = useState<Studio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { getStudio } = useStudio();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Form states
  const [studioName, setStudioName] = useState('');
  const [description, setDescription] = useState('');
  const [founder, setFounder] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

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
        
        // Populate form with studio data
        setStudioName(studioData.name);
        setDescription(studioData.description || '');
        setFounder(studioData.founder.toString());
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

  const handleSaveSettings = () => {
    // TODO: Implement save settings API call
    console.log('Saving settings:', {
      studioName,
      description,
      founder,
      isPublic,
      allowMessages,
      emailNotifications
    });
  };

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Studio Settings</h1>
          <p className="text-gray-400">Manage settings and preferences for {studio.name}</p>
        </div>

        <div className="space-y-8">
          {/* General Settings */}
          <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">General Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Studio Name
                </label>
                <input
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  className="w-full bg-[#131618] border border-[#2A2D30] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#FDD811]"
                  placeholder="Enter studio name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-[#131618] border border-[#2A2D30] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#FDD811]"
                  placeholder="Describe your studio..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Founder Name
                </label>
                <input
                  type="text"
                  value={founder}
                  onChange={(e) => setFounder(e.target.value)}
                  className="w-full bg-[#131618] border border-[#2A2D30] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#FDD811]"
                  placeholder="Enter founder name"
                />
              </div>
            </div>
          </div>

          {/* Profile Images */}
          <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Profile Images</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Studio Avatar
                </label>
                <div className="flex items-center space-x-4">
                  {studio.badge ? (
                    <img
                      src={studio.badge}
                      alt="Studio avatar"
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-600 flex items-center justify-center">
                      <span className="text-lg font-bold">{studio.name.charAt(0)}</span>
                    </div>
                  )}
                  <button className="px-4 py-2 bg-[#2A2D30] text-white rounded-lg hover:bg-[#3A3D40] transition-colors">
                    Change Avatar
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Studio Banner
                </label>
                <div className="space-y-2">
                  {studio.banner && (
                    <div className="w-full h-24 rounded-lg overflow-hidden">
                      <img
                        src={studio.banner}
                        alt="Studio banner"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <button className="px-4 py-2 bg-[#2A2D30] text-white rounded-lg hover:bg-[#3A3D40] transition-colors">
                    {studio.banner ? 'Change Banner' : 'Add Banner'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Privacy Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Public Studio</h3>
                  <p className="text-gray-400 text-sm">Allow your studio to be visible to the public</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FDD811]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Allow Messages</h3>
                  <p className="text-gray-400 text-sm">Let users send you messages through your studio</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowMessages}
                    onChange={(e) => setAllowMessages(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FDD811]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Notification Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Email Notifications</h3>
                  <p className="text-gray-400 text-sm">Receive email notifications for important updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FDD811]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-[#1A1C21] border border-red-500/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-6">Danger Zone</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div>
                  <h3 className="text-white font-medium">Delete Studio</h3>
                  <p className="text-gray-400 text-sm">Permanently delete this studio and all its data</p>
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Delete Studio
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <button className="px-6 py-3 bg-[#2A2D30] text-white rounded-lg hover:bg-[#3A3D40] transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              className="px-6 py-3 bg-[#FDD811] text-black rounded-lg font-medium hover:bg-[#FDD811]/90 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
