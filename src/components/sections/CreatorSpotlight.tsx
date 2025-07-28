'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getAllStudios } from '@/lib/api/studioService';
import { getProductsByStudio } from '@/lib/api/products';

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
  { id: 3, name: "Dragon's Workshop", models: 28, downloads: "6.2K", avatar: "DW" },
  { id: 4, name: "Mystic Miniatures", models: 38, downloads: "9.1K", avatar: "MM" },
  { id: 5, name: "Forge Masters", models: 41, downloads: "10.3K", avatar: "FM" }
];

export default function CreatorSpotlight({ 
  creators, 
  className = "" 
}: CreatorSpotlightProps) {
  const [studios, setStudios] = useState<Creator[]>(creators || defaultCreators);
  const [loading, setLoading] = useState(!creators);

  const formatDownloads = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const loadStudios = useCallback(async () => {
    try {
      const studiosData = await getAllStudios();
      
      // Take the first 5 studios and fetch their product counts
      const topStudios = studiosData.slice(0, 5);
      
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
          } catch {
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
  }, [formatDownloads]);

  useEffect(() => {
    if (!creators) {
      loadStudios();
    }
  }, [creators, loadStudios]);
  return (
    <div 
      className={className} 
      style={{ 
        background: 'linear-gradient(90deg, rgba(84.59, 44.49, 37.42, 0.20) 0%, rgba(75, 43, 25, 0.20) 25%, rgba(68, 42, 15, 0.20) 50%, rgba(62, 41, 8, 0.20) 75%, rgba(60.07, 41.69, 2.02, 0.20) 100%)',
        borderTopWidth: 'var(--border-width)', 
        borderBottomWidth: 'var(--border-width)', 
        borderColor: '#374151' 
      }}
    >
      <div className="max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center mb-8">
          <div className="text-center w-full" style={{ maxWidth: '1720px' }}>
            <h2 
              className="mb-2 text-[#F4F4F4] text-5xl font-extrabold break-words"
              style={{
                fontFamily: 'Open Sans'
              }}
            >
              CREATORS CORNER
            </h2>
            <p className="text-gray-400 text-xl">Meet the talented artists behind amazing 3D models</p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="w-full" style={{ maxWidth: '1720px' }}>
            {loading ? (
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-full max-w-[300px] animate-pulse">
                    <div 
                      className="rounded-2xl p-3 flex flex-col aspect-[10/9]"
                      style={{ background: 'rgba(0, 0, 0, 0.10)' }}
                    >
                      {/* Image placeholder */}
                      <div className="bg-gray-700 rounded-lg flex-1 mb-3" />
                      
                      {/* Name placeholder */}
                      <div 
                        className="rounded-lg mb-3 flex items-center justify-center"
                        style={{ background: 'rgba(255, 255, 255, 0.10)', height: '37px' }}
                      >
                        <div className="bg-gray-700 rounded w-24 h-4" />
                      </div>
                      
                      {/* Models count placeholder */}
                      <div className="text-center">
                        <div className="bg-gray-700 rounded w-20 h-4 mx-auto" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
              >
                {studios.map((studio) => (
                  <div 
                    key={studio.id} 
                    className="w-full max-w-[300px] hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <div 
                      className="rounded-2xl p-3 flex flex-col aspect-[10/9]"
                      style={{ background: 'rgba(0, 0, 0, 0.10)' }}
                    >
                      {/* Studio Image */}
                      <div className="rounded-lg overflow-hidden flex-1 mb-3">
                        {studio.logo ? (
                          <Image 
                            src={studio.logo} 
                            alt={studio.name} 
                            fill
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center text-white text-4xl sm:text-5xl lg:text-6xl font-bold"
                            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                          >
                            {studio.avatar}
                          </div>
                        )}
                      </div>
                      
                      {/* Studio Name */}
                      <div 
                        className="rounded-lg mb-3 flex items-center justify-center text-center text-white text-lg sm:text-xl lg:text-lg font-normal px-3 break-words"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.10)', 
                          height: '37px',
                          fontFamily: 'Open Sans'
                        }}
                      >
                        {studio.name}
                      </div>
                      
                      {/* Models Count */}
                      <div 
                        className="text-center text-white text-sm sm:text-base lg:text-base break-words"
                        style={{ fontFamily: 'Open Sans' }}
                      >
                        <span className="font-bold">Models</span>
                        <span className="font-normal"> {studio.models}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Call to Action for Creators */}
        <div className="mt-12 flex justify-center">
          <div className="w-full" style={{ maxWidth: '1720px', paddingLeft: '40px', paddingRight: '40px' }}>
            <div 
              className="rounded-2xl px-10 py-6 flex items-center justify-between w-full"
              style={{ 
                background: 'rgba(255, 255, 255, 0.04)'
              }}
            >
              {/* Left Content */}
              <div className="flex items-center gap-4">
                {/* Main Text */}
                <h3 
                  className="text-[#FDD811] text-2xl sm:text-3xl lg:text-4xl font-extrabold break-words whitespace-nowrap"
                  style={{ fontFamily: 'Open Sans' }}
                >
                  ARE YOU A CREATOR?
                </h3>
                
                {/* Description */}
                <p 
                  className="text-[#F4F4F4] text-lg sm:text-xl lg:text-2xl font-normal break-words hidden md:block"
                  style={{ fontFamily: 'Open Sans' }}
                >
                  Join STL Forge and benefits from the highest pay rate in the field.
                </p>
              </div>
              
              {/* Button */}
              <button 
                className="px-6 py-2.5 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity bg-[#FDD811] flex-shrink-0"
              >
                <span 
                  className="text-[#282828] text-xl lg:text-2xl font-normal leading-8 break-words whitespace-nowrap"
                  style={{ fontFamily: 'Open Sans' }}
                >
                  Find out more
                </span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Description */}
        <div className="md:hidden mt-4 flex justify-center">
          <div className="w-full" style={{ maxWidth: '1720px' }}>
            <p 
              className="text-[#F4F4F4] text-lg font-normal break-words text-center px-4"
              style={{ fontFamily: 'Open Sans' }}
            >
              Join STL Forge and benefits from the highest pay rate in the field.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
