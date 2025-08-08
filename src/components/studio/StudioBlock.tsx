'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Studio } from '@/types/studio';
import { Studio as ProductStudio } from '@/types/product';
import { followStudio, unfollowStudio } from '@/lib/api/studioService';
import DefaultAvatar from '@/components/ui/DefaultAvatar';
import { RiUserFollowLine, RiUserUnfollowLine } from 'react-icons/ri';

interface StudioBlockProps {
  studio: Studio | ProductStudio;
  className?: string;
}

export default function StudioBlock({ studio, className = '' }: StudioBlockProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // TODO: Check if user is already following this studio
  useEffect(() => {
    // This would need to be implemented to check current follow status
    // For now, we'll assume not following
    setIsFollowing(false);
  }, [studio.id]);

  const handleFollowToggle = async () => {
    setIsLoading(true);
    try {
      if (isFollowing) {
        await unfollowStudio(studio.id);
        setIsFollowing(false);
      } else {
        await followStudio(studio.id);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions to safely access properties
  const getFollowerCount = () => {
    return 'follower_count' in studio ? studio.follower_count : 0;
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Studio Avatar */}
      <div className="relative">
        {imageError || !studio.badge || studio.badge.includes('/None/') ? (
          <DefaultAvatar className="ring-2 ring-gray-600" size={48} />
        ) : (
          <Image
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg ring-2 ring-gray-600 object-cover"
            src={studio.badge}
            alt={`${studio.name} badge`}
            width={48}
            height={48}
            onError={() => setImageError(true)}
          />
        )}
      </div>

      {/* Studio Details */}
      <div>
        <Link 
          href={`/public/studio/${studio.id}`}
          className="text-white text-sm sm:text-base font-medium hover:text-primary transition-colors"
        >
          by {studio.name}
        </Link>
        <p className="text-gray-400 text-xs sm:text-sm">
          {getFollowerCount()} follower{getFollowerCount() !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Follow Button - Close to studio info */}
      <button
        onClick={handleFollowToggle}
        disabled={isLoading}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
          ${isFollowing 
            ? 'bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white border border-gray-600 hover:border-red-600' 
            : 'bg-primary text-white hover:bg-primary/80 border border-primary hover:border-primary/80'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isFollowing ? (
          <RiUserUnfollowLine className="w-4 h-4" />
        ) : (
          <RiUserFollowLine className="w-4 h-4" />
        )}
        <span>
          {isLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
        </span>
      </button>
    </div>
  );
}
