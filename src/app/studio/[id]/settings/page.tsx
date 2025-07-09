'use client';

import { useEffect, useState } from 'react';
import { useStudio } from '@/context/StudioContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { notFound, useRouter } from 'next/navigation';
import ImageUploadZone from '@/components/studio/ImageUploadZone';
import { updateStudio } from '@/lib/api/studioService';
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
  const [founder, setFounder] = useState('');
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
    founder: string;
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
        setFounder(studioData.founder.toString());
        
        // Store original values
        setOriginalValues({
          name: studioData.name,
          description: studioData.description || '',
          founder: studioData.founder.toString()
        });
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

  // Check for changes whenever form values update
  useEffect(() => {
    if (!originalValues) return;
    
    const formHasChanges = 
      studioName !== originalValues.name ||
      description !== originalValues.description ||
      founder !== originalValues.founder ||
      avatarFile !== null ||
      bannerFile !== null;
    
    setHasChanges(formHasChanges);
  }, [studioName, description, founder, avatarFile, bannerFile, originalValues]);

  const handleSaveSettings = async () => {
    if (!studioId || !hasChanges || isSaving) return;
    
    try {
      setIsSaving(true);
      
      const updateData: any = {};
      
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
        description: updatedStudio.description || '',
        founder: updatedStudio.founder.toString()
      });
      
      // Reset file states
      setAvatarFile(null);
      setBannerFile(null);
      
      showToast('Studio settings updated successfully', 'success');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      showToast(error.message || 'Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!originalValues) return;
    
    // Reset to original values
    setStudioName(originalValues.name);
    setDescription(originalValues.description);
    setFounder(originalValues.founder);
    setAvatarFile(null);
    setBannerFile(null);
  };

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Studio Settings</h1>
          <p className="text-text-secondary">Manage settings and preferences for {studio.name}</p>
        </div>

        <div className="space-y-8">
          {/* General Settings */}
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6">General Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Studio Name
                </label>
                <input
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  className="w-full bg-background border border-border text-text-primary rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                  placeholder="Enter studio name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-background border border-border text-text-primary rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                  placeholder="Describe your studio..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Founder Name
                </label>
                <input
                  type="text"
                  value={founder}
                  onChange={(e) => setFounder(e.target.value)}
                  className="w-full bg-background border border-border text-text-primary rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                  placeholder="Enter founder name"
                />
              </div>
            </div>
          </div>

          {/* Profile Images */}
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Profile Images</h2>
            
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

          {/* Privacy Settings */}
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Privacy Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-text-primary font-medium">Public Studio</h3>
                  <p className="text-text-secondary text-sm">Allow your studio to be visible to the public</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-text-primary font-medium">Allow Messages</h3>
                  <p className="text-text-secondary text-sm">Let users send you messages through your studio</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowMessages}
                    onChange={(e) => setAllowMessages(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Notification Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-text-primary font-medium">Email Notifications</h3>
                  <p className="text-text-secondary text-sm">Receive email notifications for important updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-background-secondary border border-red-500/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-6">Danger Zone</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div>
                  <h3 className="text-text-primary font-medium">Delete Studio</h3>
                  <p className="text-text-secondary text-sm">Permanently delete this studio and all its data</p>
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Delete Studio
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <button 
              onClick={handleCancel}
              disabled={!hasChanges || isSaving}
              className="px-6 py-3 bg-border text-text-primary rounded-lg hover:bg-border-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={!hasChanges || isSaving}
              className={`
                px-6 py-3 rounded-lg font-medium transition-all
                ${hasChanges && !isSaving
                  ? 'bg-primary text-black hover:bg-primary-hover cursor-pointer'
                  : 'bg-gray-600 text-text-secondary cursor-not-allowed'
                }
              `}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
