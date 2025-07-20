'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Studio, MyStudioResponse } from '@/types/studio';
import { 
  getStudioDetails,
  createStudio,
  updateStudio,
  followStudio,
  unfollowStudio,
  getFollowedStudios
} from '@/lib/api/studioService';
import { getCurrentUser } from '@/lib/api/authService';
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

  // Load my studio using user endpoint (no more 404 errors!)
  const loadMyStudio = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('🔐 Not authenticated, skipping studio load');
      setMyStudio(null);
      return;
    }

    console.log('🏢 Loading user data with studio info...');
    setMyStudioLoading(true);
    try {
      const user = await getCurrentUser();
      console.log('✅ User data loaded successfully:', user);
      
      if (user.studio && user.role) {
        // User has a studio - create MyStudioResponse format
        const studioResponse: MyStudioResponse = {
          studio: {
            id: user.studio.id,
            name: user.studio.name,
            description: '', // We don't have this from user endpoint, will be loaded when needed
            banner: undefined,
            badge: undefined,
            founder: user.pk,
            created_at: new Date().toISOString(), // Default value
            updated_at: new Date().toISOString(), // Default value
            status: 'active',
            member_count: 1, // Default value
            follower_count: 0 // Default value
          },
          membership: {
            role: user.role,
            status: 'active',
            joined_at: new Date().toISOString() // Default value
          }
        };
        
        console.log('✅ User has studio:', studioResponse);
        setMyStudio(studioResponse);
      } else {
        // User doesn't have a studio - this is normal and expected
        console.log('📋 User has no studio (normal)');
        setMyStudio(null);
      }
    } catch (error: unknown) {
      console.log('❌ Error loading user data:', error);
      console.log('   - Message:', error instanceof Error ? error.message : 'Unknown error');
      
      console.error('Error loading user information:', error);
      showError('Failed to load user information');
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
    } catch (error: unknown) {
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
      // Load both my studio and followed studios automatically
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
      
      // Handle both possible response formats
      const studio = response.studio || response; // response might be the studio directly
      
      setMyStudio({
        studio: studio,
        membership: {
          role: 'owner',
          status: 'active',
          joined_at: studio.created_at
        }
      });
      
      showSuccess('Studio created successfully!');
      return studio;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create studio';
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update studio';
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to follow studio';
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unfollow studio';
      showError(errorMessage);
      throw error;
    }
  }, [loadFollowedStudios, showError, showSuccess]);

  // Get studio details
  const getStudio = useCallback(async (id: number): Promise<Studio> => {
    try {
      return await getStudioDetails(id);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load studio details';
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
