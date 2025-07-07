// data/mock-studios.ts
import type { Studio, StudioMember, StudioFollower } from '@/types/studio';

export const mockStudios: Studio[] = [
  {
    id: 1,
    name: "Magnetic Foundry",
    description: "Premium 3D miniatures and terrain for tabletop gaming",
    banner: "https://picsum.photos/seed/banner1/800/200",
    badge: "https://picsum.photos/seed/logo1/100",
    founder: 1,
    created_at: "2024-01-01T12:00:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    status: "active",
    member_count: 3,
    follower_count: 15
  },
  {
    id: 2,
    name: "Elven Forge",
    description: "Fantasy miniatures and magical terrain pieces",
    banner: "https://picsum.photos/seed/banner2/800/200",
    badge: "https://picsum.photos/seed/logo2/100",
    founder: 2,
    created_at: "2024-01-05T14:20:00Z",
    updated_at: "2024-01-20T16:45:00Z",
    status: "active",
    member_count: 2,
    follower_count: 8
  },
  {
    id: 3,
    name: "Dragon's Workshop",
    description: "Epic dragons and mythical creatures for your campaigns",
    banner: "https://picsum.photos/seed/banner3/800/200",
    badge: "https://picsum.photos/seed/logo3/100",
    founder: 4,
    created_at: "2024-01-10T09:15:00Z",
    updated_at: "2024-01-25T11:20:00Z",
    status: "active",
    member_count: 1,
    follower_count: 12
  }
];

export const mockStudioMembers: StudioMember[] = [
  {
    id: 1,
    member: 1,
    studio: 1,
    status: "active",
    role: "owner",
    created_at: "2024-01-01T12:00:00Z",
    updated_at: "2024-01-01T12:00:00Z"
  },
  {
    id: 2,
    member: 3,
    studio: 1,
    status: "active",
    role: "member",
    created_at: "2024-01-02T14:30:00Z",
    updated_at: "2024-01-02T14:30:00Z"
  },
  {
    id: 3,
    member: 5,
    studio: 1,
    status: "active",
    role: "admin",
    created_at: "2024-01-03T16:45:00Z",
    updated_at: "2024-01-03T16:45:00Z"
  },
  {
    id: 4,
    member: 2,
    studio: 2,
    status: "active",
    role: "owner",
    created_at: "2024-01-05T14:20:00Z",
    updated_at: "2024-01-05T14:20:00Z"
  },
  {
    id: 5,
    member: 6,
    studio: 2,
    status: "active",
    role: "member",
    created_at: "2024-01-06T10:15:00Z",
    updated_at: "2024-01-06T10:15:00Z"
  },
  {
    id: 6,
    member: 4,
    studio: 3,
    status: "active",
    role: "owner",
    created_at: "2024-01-10T09:15:00Z",
    updated_at: "2024-01-10T09:15:00Z"
  }
];

export const mockStudioFollowers: StudioFollower[] = [
  {
    user: "tim",
    studio: "Magnetic Foundry",
    notify_activity_by_email: false,
    since: "2024-01-15T10:00:00Z"
  },
  {
    user: "papuche",
    studio: "Elven Forge",
    notify_activity_by_email: true,
    since: "2024-01-20T14:30:00Z"
  }
];

// Helper functions for mock data
export function getStudioById(id: number): Studio | undefined {
  return mockStudios.find(studio => studio.id === id);
}

export function getStudioByName(name: string): Studio | undefined {
  return mockStudios.find(studio => studio.name.toLowerCase() === name.toLowerCase());
}

export function getUserStudioMembership(userId: number): StudioMember | undefined {
  return mockStudioMembers.find(member => member.member === userId && member.status === 'active');
}

export function getStudioMembers(studioId: number): StudioMember[] {
  return mockStudioMembers.filter(member => member.studio === studioId && member.status === 'active');
}

export function getUserFollowedStudios(username: string): Studio[] {
  const followedStudioNames = mockStudioFollowers
    .filter(follower => follower.user === username)
    .map(follower => follower.studio);
  
  return mockStudios.filter(studio => followedStudioNames.includes(studio.name));
}

export function isUserFollowingStudio(username: string, studioName: string): boolean {
  return mockStudioFollowers.some(
    follower => follower.user === username && follower.studio === studioName
  );
}

// Legacy export for backward compatibility
export const studios = mockStudios.map(studio => ({
  id: studio.id,
  name: studio.name,
  creatorlogo: studio.badge
}));
