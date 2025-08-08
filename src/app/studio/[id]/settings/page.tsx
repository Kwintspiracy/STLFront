'use client';

import { useEffect, useState } from 'react';
import { useStudio } from '@/context/StudioContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUploadZone from '@/components/studio/ImageUploadZone';
import { updateStudio } from '@/lib/api/studioService';
import { FaChevronRight, FaUser, FaCrown, FaBell, FaExclamationTriangle, FaSave, FaTimes } from 'react-icons/fa';
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
  const { showToast } = useToast();
  const router = useRouter();

  // Form states
  const [studioName, setStudioName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  
  // Image states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  
  // Track if form has changes
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Original values to compare changes
  const [originalValues, setOriginalValues] = useState<{
    name: string;
    description: string;
  } | null>(null);

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
        
        // Store original values
        setOriginalValues({
          name: studioData.name,
          description: studioData.description || ''
        });
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

  // Check for changes whenever form values update
  useEffect(() => {
    if (!originalValues) return;
    
    const formHasChanges = 
      studioName !== originalValues.name ||
      description !== originalValues.description ||
      avatarFile !== null ||
      bannerFile !== null;
    
    setHasChanges(formHasChanges);
  }, [studioName, description, avatarFile, bannerFile, originalValues]);

  const handleSaveSettings = async () => {
    if (!studioId || !hasChanges || isSaving) return;
    
    try {
      setIsSaving(true);
      
      const updateData: Record<string, unknown> = {};
      
      // Only include changed text fields
      if (studioName !== originalValues?.name) {
        updateData.name = studioName;
      }
      if (description !== originalValues?.description) {
        updateData.description = description;
      }
      
      // Include image files if they were changed
      if (avatarFile) {
        updateData.badge = avatarFile;
      }
      if (bannerFile) {
        updateData.banner = bannerFile;
      }
      
      const updatedStudio = await updateStudio(studioId, updateData);
      
      // Update the studio in context
      setStudio(updatedStudio);
      
      // Update original values
      setOriginalValues({
        name: updatedStudio.name,
        description: updatedStudio.description || ''
      });
      
      // Reset file states
      setAvatarFile(null);
      setBannerFile(null);
      
      showToast('Studio settings updated successfully', 'success');
    } catch (error: unknown) {
      console.error('Error saving settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
      showToast(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!originalValues) return;
    
    // Reset to original values
    setStudioName(originalValues.name);
    setDescription(originalValues.description);
    setAvatarFile(null);
    setBannerFile(null);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-[#F4F4F4] text-lg font-medium">Loading studio settings...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <div className="text-red-400 text-lg font-medium mb-2">Error Loading Studio</div>
          <div className="text-[#9ca3af] text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!studio) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8 sm:mb-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-4">
            <Link 
              href={`/studio/${studioId}`}
              className="text-[#9ca3af] hover:text-primary transition-colors"
            >
              Studio Dashboard
            </Link>
            <FaChevronRight className="w-3 h-3 text-[#9ca3af]" />
            <span className="text-[#F4F4F4]">Settings</span>
          </nav>
          
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
            <span className="text-primary">STUDIO</span>
            <span className="text-white"> SETTINGS</span>
          </h1>
          <p className="text-[#9ca3af] text-base sm:text-lg">
            Manage settings and preferences for <span className="text-primary font-medium">{studio.name}</span>
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8">
          
          {/* Studio Profile Section */}
          <div 
            className="rounded-xl p-6 sm:p-8"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FaUser className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#F4F4F4]">Studio Profile</h2>
                <p className="text-[#9ca3af] text-sm">Basic information about your studio</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Studio Name */}
              <div>
                <label className="block text-sm font-semibold text-[#F4F4F4] mb-3">
                  Studio Name
                </label>
                <input
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  className="w-full bg-white/5 text-[#F4F4F4] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors placeholder-[#9ca3af]"
                  placeholder="Enter your studio name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-[#F4F4F4] mb-3">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-white/5 text-[#F4F4F4] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors placeholder-[#9ca3af] resize-none"
                  placeholder="Tell people about your studio..."
                />
              </div>

              {/* Profile Images */}
              <div>
                <h3 className="text-lg font-semibold text-[#F4F4F4] mb-4">Profile Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ImageUploadZone
                    currentImage={studio.badge}
                    onImageChange={setAvatarFile}
                    aspectRatio="square"
                    label="Studio Avatar"
                    maxSizeMB={2}
                  />

                  <ImageUploadZone
                    currentImage={studio.banner}
                    onImageChange={setBannerFile}
                    aspectRatio="banner"
                    label="Studio Banner"
                    maxSizeMB={5}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Founder Information Section */}
          <div 
            className="rounded-xl p-6 sm:p-8"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <FaCrown className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#F4F4F4]">Founder Information</h2>
                <p className="text-[#9ca3af] text-sm">Studio ownership and creation details</p>
              </div>
            </div>
            
            <div className="max-w-md">
              <div>
                <label className="block text-sm font-semibold text-[#F4F4F4] mb-3">
                  Founder Username
                </label>
                <div className="w-full bg-gray-800/30 text-[#9ca3af] rounded-lg px-4 py-3 cursor-not-allowed">
                  {studio.founder_username || studio.founder_name || `User #${studio.founder}`}
                </div>
                <p className="text-xs text-[#9ca3af] mt-2">This field cannot be modified</p>
              </div>
            </div>
          </div>

          {/* Privacy & Notifications Section */}
          <div 
            className="rounded-xl p-6 sm:p-8"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <FaBell className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#F4F4F4]">Privacy & Notifications</h2>
                <p className="text-[#9ca3af] text-sm">Control your studio visibility and notifications</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Public Studio Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                <div className="flex-1">
                  <h3 className="text-[#F4F4F4] font-semibold mb-1">Public Studio</h3>
                  <p className="text-[#9ca3af] text-sm">Allow your studio to be visible to the public</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Allow Messages Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                <div className="flex-1">
                  <h3 className="text-[#F4F4F4] font-semibold mb-1">Allow Messages</h3>
                  <p className="text-[#9ca3af] text-sm">Let users send you messages through your studio</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={allowMessages}
                    onChange={(e) => setAllowMessages(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Email Notifications Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                <div className="flex-1">
                  <h3 className="text-[#F4F4F4] font-semibold mb-1">Email Notifications</h3>
                  <p className="text-[#9ca3af] text-sm">Receive email notifications for important updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Danger Zone Section */}
          <div 
            className="rounded-xl p-6 sm:p-8"
            style={{ background: 'rgba(239, 68, 68, 0.05)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <FaExclamationTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-red-400">Danger Zone</h2>
                <p className="text-[#9ca3af] text-sm">Irreversible and destructive actions</p>
              </div>
            </div>
            
            <div className="p-4 bg-red-500/10 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-[#F4F4F4] font-semibold mb-1">Delete Studio</h3>
                  <p className="text-[#9ca3af] text-sm">
                    Permanently delete this studio and all its data. This action cannot be undone.
                  </p>
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium whitespace-nowrap">
                  Delete Studio
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        {hasChanges && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
              <button 
                onClick={handleCancel}
                disabled={isSaving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 text-[#F4F4F4] rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <FaTimes className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
