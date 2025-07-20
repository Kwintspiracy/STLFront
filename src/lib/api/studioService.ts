// src/lib/api/studioService.ts
import { USE_MOCK_DATA, STUDIO_ENDPOINTS } from './config';
import { apiRequest } from './httpClient';
import type {
  Studio,
  CreateStudioRequest,
  CreateStudioResponse,
  UpdateStudioRequest,
  MyStudioResponse,
  FollowStudioRequest,
  FollowStudioResponse,
  UnfollowStudioResponse,
  FollowPreferencesRequest,
  FollowPreferencesResponse
} from '@/types/studio';
import {
  mockStudios,
  mockStudioFollowers,
  getStudioById,
  getUserStudioMembership,
  getUserFollowedStudios,
  isUserFollowingStudio
} from '@/data/mock-studios';

// Create Studio
export async function createStudio(data: CreateStudioRequest): Promise<CreateStudioResponse> {
  if (USE_MOCK_DATA) {
    // Mock implementation
    const newStudio: Studio = {
      id: Math.max(...mockStudios.map(s => s.id)) + 1,
      name: data.name,
      description: data.description || '',
      banner: data.banner ? 'https://picsum.photos/seed/banner-new/800/200' : undefined,
      badge: data.badge ? 'https://picsum.photos/seed/badge-new/100' : undefined,
      founder: 1, // Current user ID (mock)
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active',
      member_count: 1,
      follower_count: 0
    };

    mockStudios.push(newStudio);

    return {
      message: 'Studio created successfully',
      studio: newStudio
    };
  } else {
    // Real API implementation
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.banner) formData.append('banner', data.banner);
    if (data.badge) formData.append('badge', data.badge);

    const response = await apiRequest.post<Studio>(
      STUDIO_ENDPOINTS.CREATE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Django API now returns the full studio data directly
    return {
      message: 'Studio created successfully',
      studio: response.data
    };
  }
}

// Get Studio Details
export async function getStudioDetails(id: number): Promise<Studio> {
  if (USE_MOCK_DATA) {
    const studio = getStudioById(id);
    if (!studio) {
      throw new Error('Studio not found');
    }
    return studio;
  } else {
    const response = await apiRequest.get<Studio>(STUDIO_ENDPOINTS.DETAIL(id));
    return response.data;
  }
}

// Update Studio
export async function updateStudio(id: number, data: UpdateStudioRequest): Promise<Studio> {
  if (USE_MOCK_DATA) {
    const studioIndex = mockStudios.findIndex(s => s.id === id);
    if (studioIndex === -1) {
      throw new Error('Studio not found');
    }

    const updatedStudio: Studio = {
      ...mockStudios[studioIndex],
      name: data.name || mockStudios[studioIndex].name,
      description: data.description !== undefined ? data.description : mockStudios[studioIndex].description,
      banner: data.banner ? 'https://picsum.photos/seed/banner-updated/800/200' : mockStudios[studioIndex].banner,
      badge: data.badge ? 'https://picsum.photos/seed/badge-updated/100' : mockStudios[studioIndex].badge,
      status: data.status || mockStudios[studioIndex].status,
      updated_at: new Date().toISOString()
    };

    mockStudios[studioIndex] = updatedStudio;
    return updatedStudio;
  } else {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.banner) formData.append('banner', data.banner);
    if (data.badge) formData.append('badge', data.badge);
    if (data.status) formData.append('status', data.status);

    const response = await apiRequest.patch<Studio>(
      STUDIO_ENDPOINTS.UPDATE(id),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }
}

// Get My Studio
export async function getMyStudio(): Promise<MyStudioResponse> {
  if (USE_MOCK_DATA) {
    const currentUserId = 1; // Mock current user ID
    const membership = getUserStudioMembership(currentUserId);
    
    if (!membership) {
      throw new Error('You are not a member of any studio');
    }

    const studio = getStudioById(membership.studio);
    if (!studio) {
      throw new Error('Studio not found');
    }

    return {
      studio,
      membership: {
        role: membership.role,
        status: membership.status,
        joined_at: membership.created_at
      }
    };
  } else {
    // Use fetch instead of apiRequest to avoid console errors for expected 404s
    try {
      // Import getAccessToken here to avoid circular imports
      const { getAccessToken } = await import('@/lib/utils/tokenService');
      const token = getAccessToken();
      
      console.log('🔑 getMyStudio - Token exists:', !!token);
      console.log('🌐 getMyStudio - Endpoint:', STUDIO_ENDPOINTS.MINE);
      
      const response = await fetch(STUDIO_ENDPOINTS.MINE, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      console.log('📡 getMyStudio - Response status:', response.status);

      if (response.status === 404) {
        // User doesn't have a studio - this is expected and normal
        console.log('📋 getMyStudio - User has no studio (404)');
        throw new Error('You are not a member of any studio');
      }

      if (!response.ok) {
        console.log('❌ getMyStudio - HTTP error:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ getMyStudio - Success:', data);
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('❌ getMyStudio - Error:', errorMessage);
      // Re-throw with consistent error message for 404s
      if (errorMessage === 'You are not a member of any studio') {
        throw error;
      }
      // For other errors, create a generic error
      throw new Error('Failed to load studio information');
    }
  }
}

// Follow Studio
export async function followStudio(id: number, data: FollowStudioRequest = {}): Promise<FollowStudioResponse> {
  if (USE_MOCK_DATA) {
    const studio = getStudioById(id);
    if (!studio) {
      throw new Error('Studio not found');
    }

    const currentUsername = 'quentin'; // Mock current user
    
    if (isUserFollowingStudio(currentUsername, studio.name)) {
      throw new Error('You are already following this studio.');
    }

    const newFollower = {
      user: currentUsername,
      studio: studio.name,
      notify_activity_by_email: data.notify_activity_by_email || false,
      since: new Date().toISOString()
    };

    mockStudioFollowers.push(newFollower);
    studio.follower_count += 1;

    return {
      message: `You are now following ${studio.name}`,
      follower: newFollower
    };
  } else {
    const response = await apiRequest.post<FollowStudioResponse>(
      STUDIO_ENDPOINTS.FOLLOW(id),
      data
    );
    return response.data;
  }
}

// Unfollow Studio
export async function unfollowStudio(id: number): Promise<UnfollowStudioResponse> {
  if (USE_MOCK_DATA) {
    const studio = getStudioById(id);
    if (!studio) {
      throw new Error('Studio not found');
    }

    const currentUsername = 'quentin'; // Mock current user
    const followerIndex = mockStudioFollowers.findIndex(
      f => f.user === currentUsername && f.studio === studio.name
    );

    if (followerIndex === -1) {
      throw new Error('You are not following this studio');
    }

    mockStudioFollowers.splice(followerIndex, 1);
    studio.follower_count -= 1;

    return {
      message: `You have unfollowed ${studio.name}`
    };
  } else {
    const response = await apiRequest.delete<UnfollowStudioResponse>(
      STUDIO_ENDPOINTS.UNFOLLOW(id)
    );
    return response.data;
  }
}

// Get Follow Preferences
export async function getFollowPreferences(id: number): Promise<{ notify_activity_by_email: boolean }> {
  if (USE_MOCK_DATA) {
    const studio = getStudioById(id);
    if (!studio) {
      throw new Error('Studio not found');
    }

    const currentUsername = 'quentin'; // Mock current user
    const follower = mockStudioFollowers.find(
      f => f.user === currentUsername && f.studio === studio.name
    );

    if (!follower) {
      throw new Error('You are not following this studio');
    }

    return {
      notify_activity_by_email: follower.notify_activity_by_email
    };
  } else {
    const response = await apiRequest.get<{ notify_activity_by_email: boolean }>(
      STUDIO_ENDPOINTS.FOLLOW_PREFERENCES(id)
    );
    return response.data;
  }
}

// Update Follow Preferences
export async function updateFollowPreferences(
  id: number, 
  data: FollowPreferencesRequest
): Promise<FollowPreferencesResponse> {
  if (USE_MOCK_DATA) {
    const studio = getStudioById(id);
    if (!studio) {
      throw new Error('Studio not found');
    }

    const currentUsername = 'quentin'; // Mock current user
    const follower = mockStudioFollowers.find(
      f => f.user === currentUsername && f.studio === studio.name
    );

    if (!follower) {
      throw new Error('You are not following this studio');
    }

    follower.notify_activity_by_email = data.notify_activity_by_email;

    return {
      message: 'Follow preferences updated successfully',
      follower
    };
  } else {
    const response = await apiRequest.patch<FollowPreferencesResponse>(
      STUDIO_ENDPOINTS.FOLLOW_PREFERENCES(id),
      data
    );
    return response.data;
  }
}

// List Followed Studios
export async function getFollowedStudios(): Promise<Studio[]> {
  if (USE_MOCK_DATA) {
    const currentUsername = 'quentin'; // Mock current user
    return getUserFollowedStudios(currentUsername);
  } else {
    const response = await apiRequest.get<Studio[]>(STUDIO_ENDPOINTS.FOLLOWED);
    return response.data;
  }
}

// Get All Studios (public endpoint)
export async function getAllStudios(): Promise<Studio[]> {
  if (USE_MOCK_DATA) {
    return mockStudios;
  } else {
    try {
      // Use the correct LIST endpoint
      const response = await fetch(STUDIO_ENDPOINTS.LIST);
      if (!response.ok) {
        throw new Error(`Failed to fetch studios: ${response.status}`);
      }
      const data = await response.json();
      
      // Django REST framework returns paginated results with 'results' array
      if (data && Array.isArray(data.results)) {
        return data.results;
      }
      
      // Fallback: if data is already an array
      if (Array.isArray(data)) {
        return data;
      }
      
      console.warn("Unexpected API response format:", data);
      return [];
    } catch (error) {
      console.error("Error fetching studios:", error);
      return [];
    }
  }
}

// Helper function to check if user can manage studio
export function canManageStudio(studio: Studio, userId: number): boolean {
  if (USE_MOCK_DATA) {
    const membership = getUserStudioMembership(userId);
    return membership?.studio === studio.id && 
           membership?.role === 'owner' && 
           membership?.status === 'active';
  }
  // For real API, this would be determined by the backend
  return false;
}
