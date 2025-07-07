// src/types/studio.ts

export interface Studio {
  id: number;
  name: string;
  description?: string;
  banner?: string;
  badge?: string;
  founder: number;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | 'suspended';
  member_count: number;
  follower_count: number;
}

export interface StudioMember {
  id: number;
  member: number;
  studio: number;
  status: 'pending' | 'active' | 'inactive' | 'banned';
  role: 'owner' | 'admin' | 'member';
  created_at: string;
  updated_at: string;
}

export interface StudioFollower {
  user: string;
  studio: string;
  notify_activity_by_email: boolean;
  since: string;
}

export interface StudioContent {
  id: number;
  studio: number;
  creator: number;
  title: string;
  description?: string;
  file: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

// API Request/Response Types
export interface CreateStudioRequest {
  name: string;
  description?: string;
  banner?: File;
  badge?: File;
}

export interface CreateStudioResponse {
  message: string;
  studio: Studio;
}

export interface UpdateStudioRequest {
  name?: string;
  description?: string;
  banner?: File;
  badge?: File;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface MyStudioResponse {
  studio: Studio;
  membership: {
    role: 'owner' | 'admin' | 'member';
    status: 'pending' | 'active' | 'inactive' | 'banned';
    joined_at: string;
  };
}

export interface FollowStudioRequest {
  notify_activity_by_email?: boolean;
}

export interface FollowStudioResponse {
  message: string;
  follower: StudioFollower;
}

export interface UnfollowStudioResponse {
  message: string;
}

export interface FollowPreferencesRequest {
  notify_activity_by_email: boolean;
}

export interface FollowPreferencesResponse {
  message: string;
  follower: StudioFollower;
}

export interface StudioErrorResponse {
  error: string;
  details?: string;
}
