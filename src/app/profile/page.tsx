'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { getCurrentUser } from '@/lib/api/authService';
import { getMyStudio } from '@/lib/api/studioService';
import { getFollowedStudios } from '@/lib/api/studioService';
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
  
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    profilePicture: null as File | null
  });

  // Load user profile and related data
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
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
        } catch (error) {
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
        } catch (error) {
          console.error('Error loading followed studios:', error);
        }

      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
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

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user data
      if (user) {
        setUser({
          ...user,
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          bio: editForm.bio
        });
      }
      
      setEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditForm({ ...editForm, profilePicture: file });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto text-white px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-8"></div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 bg-gray-700 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-700 rounded w-32"></div>
                <div className="h-4 bg-gray-700 rounded w-48"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-4xl mx-auto text-white px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-gray-400">Unable to load your profile information.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto text-white px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">My Profile</h1>
        {!editing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/80 transition-colors"
          >
            <FaEdit className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6 sm:p-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
          {/* Profile Picture */}
          <div className="relative">
            {imageError || !user.profilePicture ? (
              <div className="w-24 h-24 rounded-full border-2 border-gray-600 bg-gray-700 flex items-center justify-center">
                <FaUserCircle className="w-16 h-16 text-gray-400" />
              </div>
            ) : (
              <Image
                src={user.profilePicture}
                alt={`${user.username}'s profile`}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full border-2 border-gray-600 object-cover"
                onError={() => setImageError(true)}
              />
            )}
            
            {editing && (
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-black rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
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
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              {editing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white flex-1"
                    placeholder="First name"
                  />
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white flex-1"
                    placeholder="Last name"
                  />
                </div>
              ) : (
                `${user.first_name} ${user.last_name}`
              )}
            </h2>
            <p className="text-gray-400 mb-1">@{user.username}</p>
            <p className="text-gray-500 text-sm capitalize">{user.role}</p>
          </div>

          {/* Edit Actions */}
          {editing && (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaSave className="w-4 h-4" />
                )}
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <FaTimes className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Email */}
          <div className="flex items-center gap-3">
            <FaEnvelope className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-white">{user.email}</p>
            </div>
          </div>

          {/* Join Date */}
          <div className="flex items-center gap-3">
            <FaCalendarAlt className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-400">Member since</p>
              <p className="text-white">
                {user.date_joined ? formatDate(user.date_joined) : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FaUser className="w-5 h-5 text-primary" />
            About
          </h3>
          {editing ? (
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white resize-none"
              rows={4}
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="text-gray-300 leading-relaxed">
              {user.bio || 'No bio available.'}
            </p>
          )}
        </div>

        {/* User Statistics */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaBox className="w-5 h-5 text-primary" />
            Activity
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/wishlist"
              className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700/70 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <FaHeart className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-2xl font-bold text-white">{userStats.wishlist_items}</p>
                  <p className="text-sm text-gray-400">Wishlist</p>
                </div>
              </div>
            </Link>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FaDownload className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{userStats.downloads}</p>
                  <p className="text-sm text-gray-400">Downloads</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FaShoppingCart className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{userStats.purchases}</p>
                  <p className="text-sm text-gray-400">Purchases</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FaUsers className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{userStats.followed_studios}</p>
                  <p className="text-sm text-gray-400">Following</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My Studio Section */}
        {myStudio && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaStore className="w-5 h-5 text-primary" />
              My Studio
            </h3>
            <div className="bg-gray-700/50 rounded-lg p-6">
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
                    <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                      <FaStore className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <Link
                      href={`/studio/${myStudio.studio.id}`}
                      className="text-lg font-semibold text-white hover:text-primary transition-colors"
                    >
                      {myStudio.studio.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        {myStudio.membership.role === 'owner' && (
                          <FaCrown className="w-3 h-3 text-yellow-400" />
                        )}
                        <span className="text-sm text-gray-400 capitalize">
                          {myStudio.membership.role}
                        </span>
                      </div>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-400">
                        {myStudio.studio.follower_count} followers
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/studio/${myStudio.studio.id}`}
                  className="px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/80 transition-colors"
                >
                  Manage Studio
                </Link>
              </div>
              {myStudio.studio.description && (
                <p className="text-gray-300 mt-4 text-sm">
                  {myStudio.studio.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Followed Studios Section */}
        {followedStudios.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaHeart className="w-5 h-5 text-primary" />
              Following ({followedStudios.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {followedStudios.slice(0, 4).map((studio) => (
                <div key={studio.id} className="bg-gray-700/50 rounded-lg p-4">
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
                      <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                        <FaStore className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Link
                        href={`/public/studio/${studio.id}`}
                        className="font-medium text-white hover:text-primary transition-colors"
                      >
                        {studio.name}
                      </Link>
                      <p className="text-sm text-gray-400">
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
    </main>
  );
}
