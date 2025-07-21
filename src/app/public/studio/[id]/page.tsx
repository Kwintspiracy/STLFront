'use client';

import { useEffect, useReducer, useCallback, useMemo, memo } from 'react';
import { useStudio } from '@/context/StudioContext';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Studio } from '@/types/studio';
import { sanitizeBasicHtml } from '@/lib/utils/sanitizeHtml';
import { StudioErrorBoundary } from '@/components/studio/StudioErrorBoundary';
import { useErrorBoundary } from '@/components/ui/ErrorBoundary';

interface Props {
  params: Promise<{ id: string }>;
}

// State management with useReducer for better performance
interface StudioState {
  studioId: number | null;
  studio: Studio | null;
  loading: boolean;
  error: string | null;
  isFollowing: boolean;
}

type StudioAction =
  | { type: 'SET_STUDIO_ID'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_STUDIO'; payload: Studio }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FOLLOWING'; payload: boolean }
  | { type: 'RESET' };

const initialState: StudioState = {
  studioId: null,
  studio: null,
  loading: true,
  error: null,
  isFollowing: false,
};

function studioReducer(state: StudioState, action: StudioAction): StudioState {
  switch (action.type) {
    case 'SET_STUDIO_ID':
      return { ...state, studioId: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_STUDIO':
      return { ...state, studio: action.payload, loading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_FOLLOWING':
      return { ...state, isFollowing: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Memoized components for better performance
const StudioHeader = memo(({ studio, isFollowing, onFollowToggle }: {
  studio: Studio;
  isFollowing: boolean;
  onFollowToggle: () => void;
}) => (
  <div className="bg-[#0F1213] border-b border-[#2A2D30]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Studio Avatar */}
        <div className="flex-shrink-0">
          {studio.badge ? (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-[#FDD811]">
              <Image
                src={studio.badge}
                alt={`${studio.name} logo`}
                fill
                className="object-cover"
                sizes="96px"
                priority
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-lg bg-gray-600 flex items-center justify-center border-2 border-[#FDD811]">
              <span className="text-2xl font-bold">{studio.name.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* Studio Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-2">{studio.name}</h1>
          <p className="text-gray-400 mb-2">Founded by {studio.founder}</p>
          <p className="text-gray-400 mb-4">{studio.follower_count} followers</p>
          
          {studio.description && (
            <div 
              className="text-gray-300 max-w-2xl mb-4"
              dangerouslySetInnerHTML={{ 
                __html: sanitizeBasicHtml(studio.description) 
              }}
            />
          )}

          {/* Follow Button */}
          <button
            onClick={onFollowToggle}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isFollowing
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-[#FDD811] text-black hover:bg-[#FDD811]/90'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
      </div>

      {/* Studio Banner */}
      {studio.banner && (
        <div className="mt-8 w-full h-64 rounded-lg overflow-hidden relative">
          <Image
            src={studio.banner}
            alt={`${studio.name} banner`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
            priority
          />
        </div>
      )}
    </div>
  </div>
));

StudioHeader.displayName = 'StudioHeader';

const StudioStats = memo(({ studio }: { studio: Studio }) => {
  // Memoize the joined year calculation
  const joinedYear = useMemo(() => new Date(studio.created_at).getFullYear(), [studio.created_at]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6 text-center">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Products</h3>
        <p className="text-2xl font-bold text-[#FDD811]">50</p>
      </div>
      
      <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6 text-center">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Downloads</h3>
        <p className="text-2xl font-bold text-[#FDD811]">2,847</p>
      </div>
      
      <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6 text-center">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Rating</h3>
        <p className="text-2xl font-bold text-[#FDD811]">4.8</p>
      </div>
      
      <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6 text-center">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Joined</h3>
        <p className="text-2xl font-bold text-[#FDD811]">{joinedYear}</p>
      </div>
    </div>
  );
});

StudioStats.displayName = 'StudioStats';

const PublicStudioProfileContent = memo(function PublicStudioProfileContent({ params }: Props) {
  const [state, dispatch] = useReducer(studioReducer, initialState);
  const { studioId, studio, loading, error, isFollowing } = state;
  
  const { getStudio } = useStudio();
  const throwError = useErrorBoundary();

  // Resolve params with useCallback for performance
  const resolveParams = useCallback(async () => {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    dispatch({ type: 'SET_STUDIO_ID', payload: id });
  }, [params]);

  useEffect(() => {
    resolveParams();
  }, [resolveParams]);

  // Load studio data with useCallback
  const loadStudio = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      const studioData = await getStudio(id);
      dispatch({ type: 'SET_STUDIO', payload: studioData });
    } catch (err: unknown) {
      console.error('Error loading studio:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load studio';
      
      // For critical errors, throw to Error Boundary
      if (err instanceof Error && (
        err.message.includes('Network Error') ||
        err.message.includes('TypeError') ||
        err.message.includes('ReferenceError')
      )) {
        throwError(new Error(`Studio loading failed: ${errorMessage}`));
        return;
      }
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        notFound();
      }
    }
  }, [getStudio, throwError]);

  useEffect(() => {
    if (studioId) {
      loadStudio(studioId);
    }
  }, [studioId, loadStudio]);

  // Memoized follow toggle handler
  const handleFollowToggle = useCallback(() => {
    dispatch({ type: 'SET_FOLLOWING', payload: !isFollowing });
    // TODO: Implement actual follow/unfollow API call
  }, [isFollowing]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131618] flex items-center justify-center">
        <div className="text-white text-lg">Loading studio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#131618] flex items-center justify-center">
        <div className="text-red-400 text-lg">Error: {error}</div>
      </div>
    );
  }

  if (!studio) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#131618] text-white">
      <StudioHeader 
        studio={studio} 
        isFollowing={isFollowing} 
        onFollowToggle={handleFollowToggle} 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StudioStats studio={studio} />
        
        {/* Products Section */}
        <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-6">Featured Products</h2>
          
          {/* Placeholder for products */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sample Product Cards */}
            <div className="bg-[#131618] border border-[#2A2D30] rounded-lg p-4">
              <div className="w-full h-48 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-400">Product Image</span>
              </div>
              <h3 className="text-white font-medium mb-2">Dragon Miniature Set</h3>
              <p className="text-gray-400 text-sm mb-3">Detailed fantasy dragon miniatures for tabletop gaming</p>
              <div className="flex items-center justify-between">
                <span className="text-[#FDD811] font-bold">$12.99</span>
                <button className="px-4 py-2 bg-[#FDD811] text-black rounded-lg text-sm font-medium hover:bg-[#FDD811]/90 transition-colors">
                  View Details
                </button>
              </div>
            </div>

            <div className="bg-[#131618] border border-[#2A2D30] rounded-lg p-4">
              <div className="w-full h-48 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-400">Product Image</span>
              </div>
              <h3 className="text-white font-medium mb-2">Fantasy Castle</h3>
              <p className="text-gray-400 text-sm mb-3">Modular castle pieces for creating epic battlefields</p>
              <div className="flex items-center justify-between">
                <span className="text-[#FDD811] font-bold">$8.50</span>
                <button className="px-4 py-2 bg-[#FDD811] text-black rounded-lg text-sm font-medium hover:bg-[#FDD811]/90 transition-colors">
                  View Details
                </button>
              </div>
            </div>

            <div className="bg-[#131618] border border-[#2A2D30] rounded-lg p-4">
              <div className="w-full h-48 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-400">Product Image</span>
              </div>
              <h3 className="text-white font-medium mb-2">Sci-Fi Vehicle Pack</h3>
              <p className="text-gray-400 text-sm mb-3">Futuristic vehicles for sci-fi gaming scenarios</p>
              <div className="flex items-center justify-between">
                <span className="text-[#FDD811] font-bold">$15.99</span>
                <button className="px-4 py-2 bg-[#FDD811] text-black rounded-lg text-sm font-medium hover:bg-[#FDD811]/90 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button className="px-6 py-3 bg-[#2A2D30] text-white rounded-lg font-medium hover:bg-[#3A3D40] transition-colors">
              View All Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// Main component wrapped with Error Boundary
export default function PublicStudioProfile(props: Props) {
  return (
    <StudioErrorBoundary>
      <PublicStudioProfileContent {...props} />
    </StudioErrorBoundary>
  );
}
