'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getAllStudios } from '@/lib/api/studioService';
import { getProductsByStudio } from '@/lib/api/products';

interface Creator {
  id: number;
  name: string;
  models: number;
  downloads: string;
  avatar: string;
  logo?: string;
  imageError?: boolean;
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

// Move formatDownloads outside component to prevent dependency cycle
const formatDownloads = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export default function CreatorSpotlight({ 
  creators, 
  className = "" 
}: CreatorSpotlightProps) {
  const [studios, setStudios] = useState<Creator[]>(creators || defaultCreators);
  const [loading, setLoading] = useState(!creators);

  // Handle image error for a specific studio
  const handleImageError = useCallback((studioId: number) => {
    setStudios(prevStudios => 
      prevStudios.map(studio => 
        studio.id === studioId 
          ? { ...studio, imageError: true }
          : studio
      )
    );
  }, []);

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
  }, []); // No dependencies - formatDownloads is now stable

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
        
        {/* Section Header - Same structure as ProductSection */}
        <div className="flex justify-center mb-5 sm:mb-6">
          <div className="w-full text-left max-w-wide">
            <div className="px-4 sm:px-0" style={{ paddingLeft: '0px', paddingRight: '0px' }}>
              <div style={{ paddingLeft: '0px', paddingRight: '0px' }} className="sm:hidden">
                <h2 
                  className="mb-2 text-[#F4F4F4] text-3xl font-extrabold break-words"
                  style={{
                    fontFamily: 'Open Sans'
                  }}
                >
                  CREATORS SPOTLIGHT
                </h2>
                <p className="text-gray-400 text-lg">Meet the talented artists behind amazing 3D models</p>
              </div>
              <div style={{ paddingLeft: '40px', paddingRight: '40px' }} className="hidden sm:block">
                <h2 
                  className="mb-2 text-[#F4F4F4] text-4xl font-extrabold break-words"
                  style={{
                    fontFamily: 'Open Sans'
                  }}
                >
                  CREATORS SPOTLIGHT
                </h2>
                <p className="text-gray-400 text-xl">Meet the talented artists behind amazing 3D models</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Studios Grid - Same alignment structure as ProductSection */}
        <div className="flex justify-center">
          <div className="w-full" style={{ maxWidth: '1720px' }}>
            {loading ? (
              <>
                {/* Mobile Loading */}
                <div className="sm:hidden">
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-full animate-pulse">
                        <div 
                          className="rounded-2xl p-3 flex flex-col h-[240px]"
                          style={{ background: 'rgba(0, 0, 0, 0.10)' }}
                        >
                          <div className="bg-gray-700 rounded-lg h-[140px] mb-3" />
                          <div 
                            className="rounded-lg mb-3 flex items-center justify-center h-[40px] px-2"
                            style={{ background: 'rgba(255, 255, 255, 0.10)' }}
                          >
                            <div className="bg-gray-700 rounded w-20 h-4" />
                          </div>
                          <div className="text-center">
                            <div className="bg-gray-700 rounded w-16 h-4 mx-auto" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Desktop Loading */}
                <div className="hidden sm:block">
                  <div 
                    className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-6"
                    style={{ paddingLeft: '40px', paddingRight: '40px' }}
                  >
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-full animate-pulse">
                        <div 
                          className="rounded-2xl p-3 flex flex-col h-[240px]"
                          style={{ background: 'rgba(0, 0, 0, 0.10)' }}
                        >
                          <div className="bg-gray-700 rounded-lg h-[140px] mb-3" />
                          <div 
                            className="rounded-lg mb-3 flex items-center justify-center h-[40px] px-2"
                            style={{ background: 'rgba(255, 255, 255, 0.10)' }}
                          >
                            <div className="bg-gray-700 rounded w-20 h-4" />
                          </div>
                          <div className="text-center">
                            <div className="bg-gray-700 rounded w-16 h-4 mx-auto" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Mobile Studios Grid */}
                <div className="sm:hidden">
                  <div className="grid grid-cols-2 gap-3">
                    {studios.map((studio) => (
                      <Link
                        key={studio.id}
                        href={`/public/studio/${studio.id}`}
                        className="w-full hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <div 
                          className="rounded-2xl p-3 flex flex-col h-[240px]"
                          style={{ background: 'rgba(0, 0, 0, 0.10)' }}
                        >
                          <div className="rounded-lg overflow-hidden h-[140px] mb-3 relative">
                            {studio.logo && studio.logo.trim() !== '' && !studio.logo.includes('/None/') && !studio.imageError ? (
                              <Image 
                                src={studio.logo} 
                                alt={studio.name} 
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                onError={() => handleImageError(studio.id)}
                                unoptimized={studio.logo?.startsWith('http')}
                              />
                            ) : (
                              <div 
                                className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
                                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                              >
                                {studio.avatar}
                              </div>
                            )}
                          </div>
                          <div 
                            className="rounded-lg mb-3 flex items-center justify-center text-center text-white text-sm font-normal px-2 h-[40px]"
                            style={{ 
                              background: 'rgba(255, 255, 255, 0.10)', 
                              fontFamily: 'Open Sans'
                            }}
                          >
                            <span className="line-clamp-2 leading-tight">
                              {studio.name}
                            </span>
                          </div>
                          <div 
                            className="text-center text-white text-sm"
                            style={{ fontFamily: 'Open Sans' }}
                          >
                            <span className="font-normal font-xs"> {studio.models} </span>
                            <span className="font-xs">Models</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                
                {/* Desktop Studios Grid - Aligned with ProductSection */}
                <div className="hidden sm:block">
                  <div 
                    className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-6"
                    style={{ paddingLeft: '40px', paddingRight: '40px' }}
                  >
                    {studios.map((studio) => (
                      <Link
                        key={studio.id}
                        href={`/public/studio/${studio.id}`}
                        className="w-full hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <div 
                          className="rounded-2xl p-3 flex flex-col h-[240px]"
                          style={{ background: 'rgba(0, 0, 0, 0.10)' }}
                        >
                          <div className="rounded-lg overflow-hidden h-[140px] mb-3 relative">
                            {studio.logo && studio.logo.trim() !== '' && !studio.logo.includes('/None/') && !studio.imageError ? (
                              <Image 
                                src={studio.logo} 
                                alt={studio.name} 
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                onError={() => handleImageError(studio.id)}
                                unoptimized={studio.logo?.startsWith('http')}
                              />
                            ) : (
                              <div 
                                className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
                                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                              >
                                {studio.avatar}
                              </div>
                            )}
                          </div>
                          <div 
                            className="rounded-lg mb-3 flex items-center justify-center text-center text-white text-sm font-normal px-2 h-[40px]"
                            style={{ 
                              background: 'rgba(255, 255, 255, 0.10)', 
                              fontFamily: 'Open Sans'
                            }}
                          >
                            <span className="line-clamp-2 leading-tight">
                              {studio.name}
                            </span>
                          </div>
                          <div 
                            className="text-center text-white text-sm"
                            style={{ fontFamily: 'Open Sans' }}
                          >
                            <span className="font-normal font-xs"> {studio.models} </span>
                            <span className="font-xs">Models</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Call to Action for Creators */}
        <div className="mt-12 sm:mt-12 flex justify-center">
          <div className="w-full px-4 sm:px-8 lg:px-10" style={{ maxWidth: '1720px' }}>
            <div 
              className="rounded-xl sm:rounded-2xl px-4 py-4 sm:px-6 sm:py-5 lg:px-4 lg:py-3 flex flex-col sm:flex-row items-center justify-between w-full gap-2 sm:gap-4"
              style={{ 
                background: 'rgba(255, 255, 255, 0.04)'
              }}
            >
              {/* Left Content */}
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2 xl:gap-x-6 text-center sm:text-left">
                {/* Main Text */}
                <h3 
                  className="text-[#FDD811] text-lg sm:text-2xl lg:text-xl font-extrabold break-words"
                  style={{ fontFamily: 'Open Sans' }}
                >
                  ARE YOU A CREATOR?
                </h3>
                
                {/* Description */}
                <p 
                  className="text-[#F4F4F4] text-sm sm:text-base lg:text-lg xl:text-base font-normal break-words"
                  style={{ fontFamily: 'Open Sans' }}
                >
                  Join STL Forge and benefits from the highest pay rates in the field.
                </p>
              </div>
              
              {/* Button */}
              <button 
                className="mt-2 sm:mt-0 -px-4 py-4 sm:px-5 sm:py-2.5 lg:px-4 lg:py-3 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity bg-[#FDD811] flex-shrink-0 w-full sm:w-auto"
              >
                <span 
                  className="text-[#282828] text-lg sm:text-base lg:text-base xl:text-lg font-semibold leading-tight break-words whitespace-nowrap"
                  style={{ fontFamily: 'Open Sans' }}
                >
                  Find out more
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
