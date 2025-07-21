'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FaUser, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaCamera,
  FaUserCircle,
  FaStore,
  FaHeart,
  FaShoppingCart,
  FaDownload,
  FaCrown,
  FaUsers,
  FaBox
} from 'react-icons/fa';
import { useToast } from '@/context/ToastContext';
import { getCurrentUser } from '@/lib/api/authService';
import { getMyStudio } from '@/lib/api/studioService';
import { getFollowedStudios } from '@/lib/api/studioService';
import type { UserProfile, UserStats, ProfileUpdateData } from '@/types/user-account';
import type { ApiUser } from '@/types/auth';
import type { Studio } from '@/types/studio';

interface MyStudioInfo {
  studio: Studio;
  membership: {
    role: 'owner' | 'admin' | 'member';
    status: string;
    joined_at: string;
  };
}

export default function UserAccountProfilePage() {
  const { showError, showSuccess } = useToast();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [myStudio, setMyStudio] = useState<MyStudioInfo | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    downloads: 0,
    purchases: 0,
    wishlist_items: 0,
    followed_studios: 0
  });
  const [followedStudios, setFollowedStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  
  const [editForm, setEditForm] = useState<ProfileUpdateData>({
    first_name: '',
    last_name: '',
    bio: '',
    profilePicture: null
  });

  // Load user profile and related data
  useEffect(() => {
    const loadUserProfile = async (): Promise<void> => {
      try {
        // Load current user
        const currentUser: ApiUser = await getCurrentUser();
        
        // Enhance with additional profile data
        const userProfile: UserProfile = {
          ...currentUser,
          id: currentUser.pk, // Map pk to id for consistency
          role: currentUser.role === 'owner' ? 'creator' : currentUser.role === 'member' ? 'user' : 'admin', // Map roles
          date_joined: '2023-01-15T10:30:00Z', // Mock data - would come from API
          bio: 'Passionate 3D designer and maker. I love creating functional and beautiful objects for everyday use.',
          total_downloads: 42,
          total_purchases: 15,
          wishlist_count: 8
        };
        
        setUser(userProfile);
        setEditForm({
          first_name: userProfile.first_name,
          last_name: userProfile.last_name,
          bio: userProfile.bio || '',
          profilePicture: null
        });

        // Load user stats
        setUserStats({
          downloads: userProfile.total_downloads || 42,
          purchases: userProfile.total_purchases || 15,
          wishlist_items: userProfile.wishlist_count || 8,
          followed_studios: 0 // Will be updated below
        });

        // Try to load user's studio if they have one
        try {
          const studioInfo: MyStudioInfo = await getMyStudio();
          setMyStudio(studioInfo);
        } catch {
          // User doesn't have a studio - this is normal
          console.log('User has no studio');
        }

        // Load followed studios
        try {
          const studios: Studio[] = await getFollowedStudios();
          setFollowedStudios(studios);
          setUserStats(prev => ({
            ...prev,
            followed_studios: studios.length
          }));
        } catch {
          console.error('Error loading followed studios');
        }

      } catch (err) {
        console.error('Error loading profile:', err);
        showError('Failed to load profile information');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [showError]);

  const handleEdit = (): void => {
    setEditing(true);
  };

  const handleCancel = (): void => {
    setEditing(false);
    if (user) {
      setEditForm({
        first_name: user.first_name,
        last_name: user.last_name,
        bio: user.bio || '',
        profilePicture: null
      });
    }
  };

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user data
      if (user) {
        const updatedUser: UserProfile = {
          ...user,
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          bio: editForm.bio
        };
        setUser(updatedUser);
        showSuccess('Profile updated successfully!');
      }
      
      setEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      showError('Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setEditForm({ ...editForm, profilePicture: file });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-background-hover rounded w-48 mb-8"></div>
        <div className="bg-background-card rounded-lg p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-background-hover rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-background-hover rounded w-32"></div>
              <div className="h-4 bg-background-hover rounded w-48"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-background-hover rounded w-full"></div>
            <div className="h-4 bg-background-hover rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Profile Not Found</h2>
        <p className="text-text-muted">Unable to load your profile information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Card */}
      <div className="bg-background-card border border-border rounded-xl p-6 sm:p-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
          {/* Profile Picture */}
          <div className="relative">
            {imageError || !user.profilePicture ? (
              <div className="w-24 h-24 rounded-full border-2 border-border bg-background-hover flex items-center justify-center">
                <FaUserCircle className="w-16 h-16 text-text-muted" />
              </div>
            ) : (
              <Image
                src={user.profilePicture}
                alt={`${user.username}'s profile`}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full border-2 border-border object-cover"
                onError={() => setImageError(true)}
              />
            )}
            
            {editing && (
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
                <FaCamera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-text-primary">
              {editing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="first_name"
                    value={editForm.first_name}
                    onChange={handleInputChange}
                    className="bg-background border border-border rounded px-3 py-1 text-text-primary flex-1 focus:outline-none focus:border-primary"
                    placeholder="First name"
                  />
                  <input
                    type="text"
                    name="last_name"
                    value={editForm.last_name}
                    onChange={handleInputChange}
                    className="bg-background border border-border rounded px-3 py-1 text-text-primary flex-1 focus:outline-none focus:border-primary"
                    placeholder="Last name"
                  />
                </div>
              ) : (
                `${user.first_name} ${user.last_name}`
              )}
            </h2>
            <p className="text-text-muted mb-1">@{user.username}</p>
            <p className="text-text-secondary text-sm capitalize">{user.role}</p>
          </div>

          {/* Edit Actions */}
          {editing ? (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-lg font-medium hover:bg-success/80 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-success-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaSave className="w-4 h-4" />
                )}
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-background-hover text-text-primary rounded-lg font-medium hover:bg-background-hover/80 transition-colors disabled:opacity-50"
              >
                <FaTimes className="w-4 h-4" />
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/80 transition-colors"
            >
              <FaEdit className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Email */}
          <div className="flex items-center gap-3">
            <FaEnvelope className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm text-text-muted">Email</p>
              <p className="text-text-primary">{user.email}</p>
            </div>
          </div>

          {/* Join Date */}
          <div className="flex items-center gap-3">
            <FaCalendarAlt className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm text-text-muted">Member since</p>
              <p className="text-text-primary">
                {user.date_joined ? formatDate(user.date_joined) : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-text-primary">
            <FaUser className="w-5 h-5 text-primary" />
            About
          </h3>
          {editing ? (
            <textarea
              name="bio"
              value={editForm.bio}
              onChange={handleInputChange}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-text-primary resize-none focus:outline-none focus:border-primary"
              rows={4}
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="text-text-secondary leading-relaxed">
              {user.bio || 'No bio available.'}
            </p>
          )}
        </div>

        {/* User Statistics */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-text-primary">
            <FaBox className="w-5 h-5 text-primary" />
            Activity
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/useraccount/wishlist"
              className="bg-background-hover rounded-lg p-4 hover:bg-background-hover/80 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <FaHeart className="w-5 h-5 text-error group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-2xl font-bold text-text-primary">{userStats.wishlist_items}</p>
                  <p className="text-sm text-text-muted">Wishlist</p>
                </div>
              </div>
            </Link>

            <div className="bg-background-hover rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FaDownload className="w-5 h-5 text-success" />
                <div>
                  <p className="text-2xl font-bold text-text-primary">{userStats.downloads}</p>
                  <p className="text-sm text-text-muted">Downloads</p>
                </div>
              </div>
            </div>

            <div className="bg-background-hover rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FaShoppingCart className="w-5 h-5 text-info" />
                <div>
                  <p className="text-2xl font-bold text-text-primary">{userStats.purchases}</p>
                  <p className="text-sm text-text-muted">Purchases</p>
                </div>
              </div>
            </div>

            <div className="bg-background-hover rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FaUsers className="w-5 h-5 text-warning" />
                <div>
                  <p className="text-2xl font-bold text-text-primary">{userStats.followed_studios}</p>
                  <p className="text-sm text-text-muted">Following</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My Studio Section */}
        {myStudio && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-text-primary">
              <FaStore className="w-5 h-5 text-primary" />
              My Studio
            </h3>
            <div className="bg-background-hover rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {myStudio.studio.badge ? (
                    <Image
                      src={myStudio.studio.badge}
                      alt={`${myStudio.studio.name} badge`}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-background rounded-lg flex items-center justify-center">
                      <FaStore className="w-6 h-6 text-text-muted" />
                    </div>
                  )}
                  <div>
                    <Link
                      href={`/studio/${myStudio.studio.id}`}
                      className="text-lg font-semibold text-text-primary hover:text-primary transition-colors"
                    >
                      {myStudio.studio.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        {myStudio.membership.role === 'owner' && (
                          <FaCrown className="w-3 h-3 text-warning" />
                        )}
                        <span className="text-sm text-text-muted capitalize">
                          {myStudio.membership.role}
                        </span>
                      </div>
                      <span className="text-text-muted">•</span>
                      <span className="text-sm text-text-muted">
                        {myStudio.studio.follower_count} followers
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/studio/${myStudio.studio.id}`}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/80 transition-colors"
                >
                  Manage Studio
                </Link>
              </div>
              {myStudio.studio.description && (
                <p className="text-text-secondary mt-4 text-sm">
                  {myStudio.studio.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Followed Studios Section */}
        {followedStudios.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-text-primary">
              <FaHeart className="w-5 h-5 text-primary" />
              Following ({followedStudios.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {followedStudios.slice(0, 4).map((studio) => (
                <div key={studio.id} className="bg-background-hover rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    {studio.badge ? (
                      <Image
                        src={studio.badge}
                        alt={`${studio.name} badge`}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
                        <FaStore className="w-5 h-5 text-text-muted" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Link
                        href={`/public/studio/${studio.id}`}
                        className="font-medium text-text-primary hover:text-primary transition-colors"
                      >
                        {studio.name}
                      </Link>
                      <p className="text-sm text-text-muted">
                        {studio.follower_count} followers
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {followedStudios.length > 4 && (
              <div className="mt-4 text-center">
                <button className="text-primary hover:text-primary/80 transition-colors">
                  View all {followedStudios.length} followed studios
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
