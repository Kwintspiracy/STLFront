'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FaUser, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaUserCircle,
  FaStore,
  FaHeart,
  FaShoppingCart,
  FaDownload,
  FaCrown,
  FaUsers,
  FaBox,
  FaExclamationTriangle,
  FaUpload,
  FaTrash
} from 'react-icons/fa';
import { getCurrentUser, updateUserProfile } from '@/lib/api/authService';
import { getMyStudio } from '@/lib/api/studioService';
import { getFollowedStudios } from '@/lib/api/studioService';
import { useToast } from '@/context/ToastContext';
import type { ApiUser } from '@/types/auth';
import type { Studio } from '@/types/studio';

interface UserProfile extends ApiUser {
  date_joined?: string;
  bio?: string;
  total_downloads?: number;
  total_purchases?: number;
  wishlist_count?: number;
}

interface UserStats {
  downloads: number;
  purchases: number;
  wishlist_items: number;
  followed_studios: number;
}

interface MyStudioInfo {
  studio: Studio;
  membership: {
    role: 'owner' | 'admin' | 'member';
    status: string;
    joined_at: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [myStudio, setMyStudio] = useState<MyStudioInfo | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    downloads: 0,
    purchases: 0,
    wishlist_items: 0,
    followed_studios: 0
  });
  const [followedStudios, setFollowedStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const { showToast } = useToast();
  
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    bio: '',
    profilePicture: null as File | null
  });

  // Load user profile and related data
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load current user
        const currentUser = await getCurrentUser();
        
        // Enhance with additional profile data
        const userProfile: UserProfile = {
          ...currentUser,
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
          username: userProfile.username,
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
          const studioInfo = await getMyStudio();
          setMyStudio(studioInfo);
        } catch {
          // User doesn't have a studio - this is normal
          console.log('User has no studio');
        }

        // Load followed studios
        try {
          const studios = await getFollowedStudios();
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
        const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
        
        // If the error is about no access token, redirect to login
        if (errorMessage.includes('No access token available') || errorMessage.includes('authentication')) {
          showToast('Please sign in to view your profile', 'error');
          router.push('/auth/signin');
          return;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [router, showToast]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    if (user) {
      setEditForm({
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        bio: user.bio || '',
        profilePicture: null
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Prepare data for API call - only include changed fields
      const updateData: {
        first_name?: string;
        last_name?: string;
        username?: string;
        bio?: string;
      } = {};

      if (editForm.first_name !== user?.first_name) {
        updateData.first_name = editForm.first_name;
      }
      if (editForm.last_name !== user?.last_name) {
        updateData.last_name = editForm.last_name;
      }
      if (editForm.username !== user?.username) {
        updateData.username = editForm.username;
      }
      if (editForm.bio !== user?.bio) {
        updateData.bio = editForm.bio;
      }

      // Only make API call if there are changes
      if (Object.keys(updateData).length > 0) {
        const updatedUser = await updateUserProfile(updateData);
        
        // Update user data with API response
        if (user) {
          setUser({
            ...user,
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name,
            username: updatedUser.username,
            bio: updateData.bio || user.bio // bio might not be returned by API
          });
        }
      }
      
      setEditing(false);
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      console.error('Error saving profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const validateImageFile = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return false;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showToast('Image file size must be less than 5MB', 'error');
      return false;
    }

    return true;
  };

  const handleImageFile = (file: File) => {
    if (!validateImageFile(file)) return;

    setEditForm({ ...editForm, profilePicture: file });
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    
    showToast('Image selected successfully', 'success');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleImageFile(files[0]);
    }
  };

  const removeImage = () => {
    setEditForm({ ...editForm, profilePicture: null });
    setImagePreview(null);
    showToast('Image removed', 'success');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-[#F4F4F4] text-lg font-medium">Loading your profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <div className="text-red-400 text-lg font-medium mb-2">Error Loading Profile</div>
          <div className="text-[#9ca3af] text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <FaUserCircle className="w-12 h-12 text-[#9ca3af] mx-auto mb-4" />
          <div className="text-[#F4F4F4] text-lg font-medium mb-2">Profile Not Found</div>
          <div className="text-[#9ca3af] text-sm">Unable to load your profile information.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-extrabold mb-3">
                <span className="text-primary">MY</span>
                <span className="text-white"> PROFILE</span>
              </h1>
              <p className="text-[#9ca3af] text-lg">
                Manage your account settings and view your activity
              </p>
            </div>
            
            {/* Edit/Save/Cancel Buttons */}
            <div className="flex gap-3">
              {!editing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-black rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  <FaEdit className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 text-[#F4F4F4] rounded-lg font-semibold hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaTimes className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-black rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          
          {/* Profile Information */}
          <div 
            className="rounded-xl p-8"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <FaUser className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-[#F4F4F4]">
                  <span className="text-blue-400">PROFILE</span>
                  <span className="text-white"> INFORMATION</span>
                </h2>
                <p className="text-[#9ca3af] text-sm">Your personal details and bio</p>
              </div>
            </div>

            <div className="space-y-8">
              
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center text-center">
                
                {/* Profile Picture Display/Upload */}
                {editing ? (
                  <div className="mb-6">
                    {/* Image Preview or Upload Zone */}
                    {imagePreview || (editForm.profilePicture && !imageError) ? (
                      <div className="relative">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden">
                          <Image
                            src={imagePreview || (user.profilePicture || '')}
                            alt="Profile preview"
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                          />
                        </div>
                        <button
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`w-64 h-32 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
                          dragActive
                            ? 'border-primary bg-primary/10'
                            : 'border-white/20 hover:border-primary/50 hover:bg-white/5'
                        }`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('profile-image-input')?.click()}
                      >
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                          <FaUpload className={`w-6 h-6 mb-2 ${dragActive ? 'text-primary' : 'text-[#9ca3af]'}`} />
                          <p className={`text-sm font-medium ${dragActive ? 'text-primary' : 'text-[#F4F4F4]'}`}>
                            {dragActive ? 'Drop image here' : 'Click or drag image here'}
                          </p>
                          <p className="text-xs text-[#9ca3af] mt-1">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                        <input
                          id="profile-image-input"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative inline-block mb-6">
                    {imageError || !user.profilePicture ? (
                      <div className="w-32 h-32 rounded-2xl bg-white/5 flex items-center justify-center">
                        <FaUserCircle className="w-20 h-20 text-[#9ca3af]" />
                      </div>
                    ) : (
                      <Image
                        src={user.profilePicture}
                        alt={`${user.username}'s profile`}
                        width={128}
                        height={128}
                        className="w-32 h-32 rounded-2xl object-cover"
                        onError={() => setImageError(true)}
                      />
                    )}
                  </div>
                )}

                {/* User Role Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                  <FaCrown className="w-4 h-4 text-primary" />
                  <span className="text-primary font-semibold capitalize">{user.role}</span>
                </div>

                {/* Current Username Display */}
                <div className="text-center">
                  <p className="text-[#9ca3af] text-sm mb-1">Current Username</p>
                  <p className="text-[#F4F4F4] font-semibold text-xl">@{user.username || 'Not set'}</p>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-[#F4F4F4] mb-6 pb-2 border-b border-white/10">
                  Personal Information
                </h3>
                
                <div className="space-y-6">
                  {/* Username Field */}
                  <div>
                    <label className="block text-sm font-semibold text-[#F4F4F4] mb-3">
                      Username
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        className="w-full bg-white/5 text-[#F4F4F4] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors placeholder-[#9ca3af]"
                        placeholder="Enter your username"
                      />
                    ) : (
                      <div className="w-full bg-white/5 text-[#F4F4F4] rounded-lg px-4 py-3">
                        @{user.username || 'Not provided'}
                      </div>
                    )}
                    {editing && (
                      <p className="text-xs text-[#9ca3af] mt-2">Your username will be visible to other users</p>
                    )}
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#F4F4F4] mb-3">
                        First Name
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          value={editForm.first_name}
                          onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                          className="w-full bg-white/5 text-[#F4F4F4] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors placeholder-[#9ca3af]"
                          placeholder="Enter your first name"
                        />
                      ) : (
                        <div className="w-full bg-white/5 text-[#F4F4F4] rounded-lg px-4 py-3">
                          {user.first_name || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#F4F4F4] mb-3">
                        Last Name
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          value={editForm.last_name}
                          onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                          className="w-full bg-white/5 text-[#F4F4F4] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors placeholder-[#9ca3af]"
                          placeholder="Enter your last name"
                        />
                      ) : (
                        <div className="w-full bg-white/5 text-[#F4F4F4] rounded-lg px-4 py-3">
                          {user.last_name || 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-semibold text-[#F4F4F4] mb-3">
                      Bio
                    </label>
                    {editing ? (
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        className="w-full bg-white/5 text-[#F4F4F4] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors placeholder-[#9ca3af] resize-none"
                        rows={4}
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <div className="w-full bg-white/5 text-[#F4F4F4] rounded-lg px-4 py-3 min-h-[100px]">
                        {user.bio || 'No bio provided yet.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h3 className="text-lg font-semibold text-[#F4F4F4] mb-6 pb-2 border-b border-white/10">
                  Account Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#F4F4F4] mb-3">
                      Email Address
                    </label>
                    <div className="w-full bg-gray-800/30 text-[#9ca3af] rounded-lg px-4 py-3 cursor-not-allowed">
                      {user.email}
                    </div>
                    <p className="text-xs text-[#9ca3af] mt-2">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#F4F4F4] mb-3">
                      Member Since
                    </label>
                    <div className="w-full bg-white/5 text-[#F4F4F4] rounded-lg px-4 py-3">
                      {user.date_joined ? formatDate(user.date_joined) : 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Statistics */}
          <div 
            className="rounded-xl p-8"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <FaBox className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-[#F4F4F4]">
                  <span className="text-green-400">ACTIVITY</span>
                  <span className="text-white"> OVERVIEW</span>
                </h2>
                <p className="text-[#9ca3af] text-sm">Your engagement and activity statistics</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link
                href="/wishlist"
                className="group p-6 rounded-xl hover:scale-105 transition-transform"
                style={{ background: 'rgba(239, 68, 68, 0.1)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                    <FaHeart className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-red-400">{userStats.wishlist_items}</p>
                    <p className="text-[#9ca3af] font-medium">Wishlist Items</p>
                  </div>
                </div>
              </Link>

              <div 
                className="p-6 rounded-xl"
                style={{ background: 'rgba(34, 197, 94, 0.1)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <FaDownload className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-400">{userStats.downloads}</p>
                    <p className="text-[#9ca3af] font-medium">Downloads</p>
                  </div>
                </div>
              </div>

              <div 
                className="p-6 rounded-xl"
                style={{ background: 'rgba(59, 130, 246, 0.1)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <FaShoppingCart className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-blue-400">{userStats.purchases}</p>
                    <p className="text-[#9ca3af] font-medium">Purchases</p>
                  </div>
                </div>
              </div>

              <div 
                className="p-6 rounded-xl"
                style={{ background: 'rgba(168, 85, 247, 0.1)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <FaUsers className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-purple-400">{userStats.followed_studios}</p>
                    <p className="text-[#9ca3af] font-medium">Following</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* My Studio Section */}
          {myStudio && (
            <div 
              className="rounded-xl p-8"
              style={{ background: 'rgba(255, 255, 255, 0.04)' }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                  <FaStore className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-[#F4F4F4]">
                    <span className="text-yellow-400">MY</span>
                    <span className="text-white"> STUDIO</span>
                  </h2>
                  <p className="text-[#9ca3af] text-sm">Your creative workspace and content</p>
                </div>
              </div>

              <div className="p-6 bg-white/5 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {myStudio.studio.badge ? (
                      <Image
                        src={myStudio.studio.badge}
                        alt={`${myStudio.studio.name} badge`}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center">
                        <FaStore className="w-8 h-8 text-[#9ca3af]" />
                      </div>
                    )}
                    <div>
                      <Link
                        href={`/studio/${myStudio.studio.id}`}
                        className="text-2xl font-bold text-[#F4F4F4] hover:text-primary transition-colors"
                      >
                        {myStudio.studio.name}
                      </Link>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          {myStudio.membership.role === 'owner' && (
                            <FaCrown className="w-4 h-4 text-yellow-400" />
                          )}
                          <span className="text-[#9ca3af] capitalize font-medium">
                            {myStudio.membership.role}
                          </span>
                        </div>
                        <span className="text-[#9ca3af]">•</span>
                        <span className="text-[#9ca3af] font-medium">
                          {myStudio.studio.follower_count.toLocaleString()} followers
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/studio/${myStudio.studio.id}`}
                    className="px-6 py-3 bg-primary text-black rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Manage Studio
                  </Link>
                </div>
                {myStudio.studio.description && (
                  <p className="text-[#9ca3af] mt-6 leading-relaxed">
                    {myStudio.studio.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Followed Studios Section */}
          {followedStudios.length > 0 && (
            <div 
              className="rounded-xl p-8"
              style={{ background: 'rgba(255, 255, 255, 0.04)' }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center">
                    <FaHeart className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#F4F4F4]">
                      <span className="text-pink-400">FOLLOWING</span>
                      <span className="text-white"> STUDIOS</span>
                    </h2>
                    <p className="text-[#9ca3af] text-sm">Studios you follow and support</p>
                  </div>
                </div>
                <span className="text-primary font-semibold">
                  {followedStudios.length} {followedStudios.length === 1 ? 'Studio' : 'Studios'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {followedStudios.slice(0, 6).map((studio) => (
                  <div key={studio.id} className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      {studio.badge ? (
                        <Image
                          src={studio.badge}
                          alt={`${studio.name} badge`}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                          <FaStore className="w-6 h-6 text-[#9ca3af]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/public/studio/${studio.id}`}
                          className="font-semibold text-[#F4F4F4] hover:text-primary transition-colors block truncate"
                        >
                          {studio.name}
                        </Link>
                        <p className="text-sm text-[#9ca3af]">
                          {studio.follower_count.toLocaleString()} followers
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {followedStudios.length > 6 && (
                <div className="mt-6 text-center">
                  <button className="text-primary hover:text-primary/80 transition-colors font-medium">
                    View all {followedStudios.length} followed studios →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
