'use client';

import { useState, useEffect } from 'react';
import { getAllStudios } from '@/lib/api/studioService';
import { getProductsByStudio } from '@/lib/api/products';
import type { Studio } from '@/types/studio';

interface Creator {
  id: number;
  name: string;
  models: number;
  downloads: string;
  avatar: string;
  logo?: string;
}

interface CreatorSpotlightProps {
  creators?: Creator[];
  className?: string;
}

const defaultCreators: Creator[] = [
  { id: 1, name: "Magnetic Foundry", models: 45, downloads: "12K", avatar: "MF" },
  { id: 2, name: "Elven Forge", models: 32, downloads: "8.5K", avatar: "EF" },
  { id: 3, name: "Dragon's Workshop", models: 28, downloads: "6.2K", avatar: "DW" }
];

export default function CreatorSpotlight({ 
  creators, 
  className = "" 
}: CreatorSpotlightProps) {
  const [studios, setStudios] = useState<Creator[]>(creators || defaultCreators);
  const [loading, setLoading] = useState(!creators);

  useEffect(() => {
    if (!creators) {
      loadStudios();
    }
  }, [creators]);

  const loadStudios = async () => {
    try {
      const studiosData = await getAllStudios();
      
      // Take the first 3 studios and fetch their product counts
      const topStudios = studiosData.slice(0, 3);
      
      const studiosWithCounts = await Promise.all(
        topStudios.map(async (studio) => {
          try {
            const products = await getProductsByStudio(studio.id);
            return {
              id: studio.id,
              name: studio.name,
              models: products.length,
              downloads: formatDownloads(studio.follower_count * 100), // Estimate based on followers
              avatar: studio.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2),
              logo: studio.badge
            };
          } catch (error) {
            // If we can't get products, use default values
            return {
              id: studio.id,
              name: studio.name,
              models: 0,
              downloads: formatDownloads(studio.follower_count * 100),
              avatar: studio.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2),
              logo: studio.badge
            };
          }
        })
      );

      setStudios(studiosWithCounts);
    } catch (error) {
      console.error('Error loading studios:', error);
      // Keep default studios on error
    } finally {
      setLoading(false);
    }
  };

  const formatDownloads = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };
  return (
    <div className={`bg-cardbackground border-y border-gray-800 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Creator Spotlight</h2>
          <p className="text-gray-400">Meet the talented artists behind amazing 3D models</p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-primarybackground border border-gray-800 rounded-lg p-6 animate-pulse">
                <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                <div className="flex justify-center gap-6">
                  <div className="h-8 bg-gray-700 rounded w-16"></div>
                  <div className="h-8 bg-gray-700 rounded w-16"></div>
                </div>
                <div className="h-8 bg-gray-700 rounded w-24 mx-auto mt-4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {studios.map((studio) => (
              <div 
                key={studio.id} 
                className="bg-primarybackground border border-gray-800 rounded-lg p-6 text-center hover:border-primary transition-colors"
              >
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-black font-bold text-xl mx-auto mb-4 overflow-hidden">
                  {studio.logo ? (
                    <img src={studio.logo} alt={studio.name} className="w-full h-full object-cover" />
                  ) : (
                    studio.avatar
                  )}
                </div>
                <h3 className="font-semibold text-white mb-2">{studio.name}</h3>
                <div className="flex justify-center gap-6 text-sm text-gray-400">
                  <div>
                    <div className="font-medium text-white">{studio.models}</div>
                    <div>Models</div>
                  </div>
                  <div>
                    <div className="font-medium text-white">{studio.downloads}</div>
                    <div>Downloads</div>
                  </div>
                </div>
                <button className="mt-4 px-4 py-2 border border-primary text-primary rounded hover:bg-primary hover:text-black transition-colors text-sm">
                  Follow
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
