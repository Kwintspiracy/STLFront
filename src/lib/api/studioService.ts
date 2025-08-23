// src/lib/api/studioService.ts
import { STUDIO_ENDPOINTS } from './config';
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

// Create Studio
export async function createStudio(data: CreateStudioRequest): Promise<CreateStudioResponse> {
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

// Get Studio Details
export async function getStudioDetails(id: number): Promise<Studio> {
  const response = await apiRequest.get<Studio>(STUDIO_ENDPOINTS.DETAIL(id));
  return response.data;
}

// Update Studio
export async function updateStudio(id: number, data: UpdateStudioRequest): Promise<Studio> {
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

// Get My Studio
export async function getMyStudio(): Promise<MyStudioResponse> {
  // Use fetch instead of apiRequest to avoid console errors for expected 404s
  try {
    // Import getAccessToken here to avoid circular imports
    const { getAccessToken } = await import('@/lib/utils/tokenService');
    const token = getAccessToken();
    
    const response = await fetch(STUDIO_ENDPOINTS.MINE, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (response.status === 404) {
      // User doesn't have a studio - this is expected and normal
      throw new Error('You are not a member of any studio');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // Re-throw with consistent error message for 404s
    if (errorMessage === 'You are not a member of any studio') {
      throw error;
    }
    // For other errors, create a generic error
    throw new Error('Failed to load studio information');
  }
}

// Follow Studio
export async function followStudio(id: number, data: FollowStudioRequest = {}): Promise<FollowStudioResponse> {
  const response = await apiRequest.post<FollowStudioResponse>(
    STUDIO_ENDPOINTS.FOLLOW(id),
    data
  );
  return response.data;
}

// Unfollow Studio
export async function unfollowStudio(id: number): Promise<UnfollowStudioResponse> {
  const response = await apiRequest.delete<UnfollowStudioResponse>(
    STUDIO_ENDPOINTS.UNFOLLOW(id)
  );
  return response.data;
}

// Get Follow Preferences
export async function getFollowPreferences(id: number): Promise<{ notify_activity_by_email: boolean }> {
  const response = await apiRequest.get<{ notify_activity_by_email: boolean }>(
    STUDIO_ENDPOINTS.FOLLOW_PREFERENCES(id)
  );
  return response.data;
}

// Update Follow Preferences
export async function updateFollowPreferences(
  id: number, 
  data: FollowPreferencesRequest
): Promise<FollowPreferencesResponse> {
  const response = await apiRequest.patch<FollowPreferencesResponse>(
    STUDIO_ENDPOINTS.FOLLOW_PREFERENCES(id),
    data
  );
  return response.data;
}

// List Followed Studios
export async function getFollowedStudios(): Promise<Studio[]> {
  const response = await apiRequest.get<Studio[]>(STUDIO_ENDPOINTS.FOLLOWED);
  return response.data;
}

// Get All Studios (public endpoint)
export async function getAllStudios(): Promise<Studio[]> {
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
    
    return [];
  } catch {
    return [];
  }
}

// Helper function to check if user can manage studio
export function canManageStudio(): boolean {
  // For real API, this would be determined by the backend
  return false;
}
