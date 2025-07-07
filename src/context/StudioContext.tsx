'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Studio, MyStudioResponse } from '@/types/studio';
import { USE_MOCK_DATA } from '@/lib/api/config';
import { 
  getMyStudio,
  getStudioDetails,
  createStudio,
  updateStudio,
  followStudio,
  unfollowStudio,
  getFollowedStudios
} from '@/lib/api/studioService';
import { getAccessToken, decodeJWTPayload } from '@/lib/utils/tokenService';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

interface StudioContextType {
  // Current user's studio
  myStudio: MyStudioResponse | null;
  myStudioLoading: boolean;
  
  // Studio operations
  createNewStudio: (data: { name: string; description?: string; banner?: File; badge?: File }) => Promise<Studio>;
  updateMyStudio: (data: { name?: string; description?: string }) => Promise<Studio>;
  
  // Follow operations
  followedStudios: Studio[];
  followedStudiosLoading: boolean;
  followStudioById: (id: number, emailNotifications?: boolean) => Promise<void>;
  unfollowStudioById: (id: number) => Promise<void>;
  
  // Studio details
  getStudio: (id: number) => Promise<Studio>;
  
  // Refresh functions
  refreshMyStudio: () => Promise<void>;
  refreshFollowedStudios: () => Promise<void>;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const [myStudio, setMyStudio] = useState<MyStudioResponse | null>(null);
  const [myStudioLoading, setMyStudioLoading] = useState(false);
  const [followedStudios, setFollowedStudios] = useState<Studio[]>([]);
  const [followedStudiosLoading, setFollowedStudiosLoading] = useState(false);

  const { showError, showSuccess } = useToast();
  const { isAuthenticated } = useAuth();

  // Load my studio
  const loadMyStudio = useCallback(async () => {
    if (!isAuthenticated) {
      setMyStudio(null);
      return;
    }

    setMyStudioLoading(true);
    try {
      const studio = await getMyStudio();
      setMyStudio(studio);
    } catch (error: any) {
      // User might not have a studio, which is normal
      if (!error.message.includes('not a member of any studio')) {
        console.error('Error loading my studio:', error);
        showError('Failed to load studio information');
      }
      setMyStudio(null);
    } finally {
      setMyStudioLoading(false);
    }
  }, [isAuthenticated, showError]);

  // Load followed studios
  const loadFollowedStudios = useCallback(async () => {
    if (!isAuthenticated) {
      setFollowedStudios([]);
      return;
    }

    setFollowedStudiosLoading(true);
    try {
      const studios = await getFollowedStudios();
      setFollowedStudios(studios);
    } catch (error: any) {
      console.error('Error loading followed studios:', error);
      showError('Failed to load followed studios');
      setFollowedStudios([]);
    } finally {
      setFollowedStudiosLoading(false);
    }
  }, [isAuthenticated, showError]);

  // Initialize data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadMyStudio();
      loadFollowedStudios();
    } else {
      setMyStudio(null);
      setFollowedStudios([]);
    }
  }, [isAuthenticated, loadMyStudio, loadFollowedStudios]);

  // Create new studio
  const createNewStudio = useCallback(async (data: { name: string; description?: string; banner?: File; badge?: File }) => {
    try {
      const response = await createStudio(data);
      setMyStudio({
        studio: response.studio,
        membership: {
          role: 'owner',
          status: 'active',
          joined_at: response.studio.created_at
        }
      });
      
      showSuccess('Studio created successfully!');
      return response.studio;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create studio';
      showError(errorMessage);
      throw error;
    }
  }, [showError, showSuccess]);

  // Update my studio
  const updateMyStudio = useCallback(async (data: { name?: string; description?: string }) => {
    if (!myStudio) {
      throw new Error('No studio to update');
    }

    try {
      const updatedStudio = await updateStudio(myStudio.studio.id, data);
      setMyStudio(prev => prev ? { ...prev, studio: updatedStudio } : null);
      showSuccess('Studio updated successfully!');
      return updatedStudio;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update studio';
      showError(errorMessage);
      throw error;
    }
  }, [myStudio, showError, showSuccess]);

  // Follow studio
  const followStudioById = useCallback(async (id: number, emailNotifications = false) => {
    try {
      await followStudio(id, { notify_activity_by_email: emailNotifications });
      await loadFollowedStudios(); // Refresh the list
      showSuccess('Studio followed successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to follow studio';
      showError(errorMessage);
      throw error;
    }
  }, [loadFollowedStudios, showError, showSuccess]);

  // Unfollow studio
  const unfollowStudioById = useCallback(async (id: number) => {
    try {
      await unfollowStudio(id);
      await loadFollowedStudios(); // Refresh the list
      showSuccess('Studio unfollowed successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to unfollow studio';
      showError(errorMessage);
      throw error;
    }
  }, [loadFollowedStudios, showError, showSuccess]);

  // Get studio details
  const getStudio = useCallback(async (id: number): Promise<Studio> => {
    try {
      return await getStudioDetails(id);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load studio details';
      showError(errorMessage);
      throw error;
    }
  }, [showError]);

  // Refresh functions
  const refreshMyStudio = useCallback(async () => {
    await loadMyStudio();
  }, [loadMyStudio]);

  const refreshFollowedStudios = useCallback(async () => {
    await loadFollowedStudios();
  }, [loadFollowedStudios]);

  const value: StudioContextType = {
    myStudio,
    myStudioLoading,
    createNewStudio,
    updateMyStudio,
    followedStudios,
    followedStudiosLoading,
    followStudioById,
    unfollowStudioById,
    getStudio,
    refreshMyStudio,
    refreshFollowedStudios,
  };

  return (
    <StudioContext.Provider value={value}>
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (context === undefined) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
}
