'use client';

import { useState, useEffect } from 'react';
import { FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Link from 'next/link';
import ProductCard from '@/components/card/ProductCard';
import { ProductSectionProps } from '@/components/card/types';

export default function ProductSection({
  title,
  products,
  variant,
  description,
  viewAllHref,
  showRanking = false,
  showDownloads = false,
  showCommercialInfo = false,
  className = ""
}: ProductSectionProps) {
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(5);
  
  // Determine if this section should use carousel
  const useCarousel = variant === 'featured' || variant === 'trending' || variant === 'commercial';
  
  // Carousel settings
  const maxProducts = 20;
  const carouselProducts = useCarousel ? products.slice(0, maxProducts) : products;
  
  // Update visible cards based on screen size
  useEffect(() => {
    const updateVisibleCards = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        if (variant === 'featured') {
          // Featured section shows 4 cards evenly spaced
          if (width >= 1280) setVisibleCards(4);      // xl: 4 cards
          else if (width >= 1024) setVisibleCards(4); // lg: 4 cards
          else if (width >= 768) setVisibleCards(3);  // md: 3 cards
          else if (width >= 640) setVisibleCards(2);  // sm: 2 cards
          else setVisibleCards(6);                     // mobile: 6 cards (3 rows x 2 cols)
        } else {
          // Other carousel sections show 5 cards
          if (width >= 1280) setVisibleCards(5);      // xl: 5 cards
          else if (width >= 1024) setVisibleCards(4); // lg: 4 cards
          else if (width >= 768) setVisibleCards(3);  // md: 3 cards
          else if (width >= 640) setVisibleCards(2);  // sm: 2 cards
          else setVisibleCards(6);                     // mobile: 6 cards (3 rows x 2 cols)
        }
      }
    };

    updateVisibleCards();
    window.addEventListener('resize', updateVisibleCards);
    return () => window.removeEventListener('resize', updateVisibleCards);
  }, [variant]);
  
  // Reset index when visible cards change
  useEffect(() => {
    if (currentIndex > carouselProducts.length - visibleCards) {
      setCurrentIndex(Math.max(0, carouselProducts.length - visibleCards));
    }
  }, [visibleCards, carouselProducts.length, currentIndex]);
  
  // Get section-specific background and styling
  const getSectionConfig = () => {
    switch (variant) {
      case 'featured':
        return {
          bgClass: 'bg-transparent',
          iconColor: 'text-yellow-500'
        };
      case 'trending':
        return {
          bgClass: 'bg-transparent',
          iconColor: 'text-orange-500'
        };
      case 'commercial':
        return {
          bgClass: 'bg-transparent',
          iconColor: 'text-green-500'
        };
      default:
        return {
          bgClass: 'bg-transparent',
          iconColor: 'text-primary'
        };
    }
  };

  const sectionConfig = getSectionConfig();

  // Carousel navigation
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex === 0) {
        return Math.max(0, carouselProducts.length - visibleCards);
      }
      return prevIndex - 1;
    });
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex >= carouselProducts.length - visibleCards) {
        return 0;
      }
      return prevIndex + 1;
    });
  };

  return (
    <div className={`${sectionConfig.bgClass} ${className}`}>
      <div className={`${useCarousel ? 'max-w-none' : 'max-w-7xl'} mx-auto px-4 sm:px-6 lg:px-8 py-12`}>
        
        {/* Section Header - Centered for carousel sections */}
        {useCarousel ? (
          <div className="flex justify-center mb-8">
            <div className="w-full" style={{ maxWidth: '1720px' }}>
              <div className="flex items-center justify-between" style={{ paddingLeft: '40px', paddingRight: '40px' }}>
                <div>
                  <h2 className="text-4xl font-extrabold">
                    {variant === 'featured' && (
                      <>
                        <span className="text-yellow-500">FEATURED</span>
                        <span className="text-white"> MODELS</span>
                      </>
                    )}
                    {variant === 'trending' && (
                      <>
                        <span className="text-orange-500">TRENDING</span>
                        <span className="text-white"> MODELS</span>
                      </>
                    )}
                    {variant === 'commercial' && (
                      <>
                        <span className="text-green-500">COMMERCIAL</span>
                        <span className="text-white"> MODELS</span>
                      </>
                    )}
                  </h2>
                  {description && (
                    <p className="text-gray-400 mt-1">{description}</p>
                  )}
                </div>
                
                
              </div>
            </div>
          </div>
        ) : (
          /* Standard Header for non-carousel sections */
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-extrabold">
                <span className="text-[#FFD700]">{title.split(' ')[0]}</span>
                <span className="text-white"> {title.split(' ').slice(1).join(' ')}</span>
              </h2>
              {description && (
                <p className="text-gray-400 mt-1">{description}</p>
              )}
            </div>
            
            {viewAllHref && (
              <Link 
                href={viewAllHref} 
                className="flex items-center gap-2 text-primary hover:text-white transition-colors text-sm"
              >
                View All <FaArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        )}
        
        {/* Products Display */}
        {useCarousel ? (
          <>
            {/* Mobile: Fixed Grid */}
            <div className="sm:hidden">
              <div className="grid grid-cols-2 gap-3 mb-6">
                {carouselProducts.slice(0, 6).map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant={variant}
                    ranking={showRanking ? index + 1 : undefined}
                    showDownloads={showDownloads}
                    showCommercialPrice={showCommercialInfo}
                    showFavorite={true}
                    className="w-full"
                  />
                ))}
              </div>
              {/* Mobile View All Button */}
              {viewAllHref && (
                <Link 
                  href={viewAllHref}
                  className="w-full bg-primary text-black py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
                >
                  View All <FaArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Desktop: Carousel Layout */}
            <div className="hidden sm:flex justify-center">
              <div className="relative w-full" style={{ maxWidth: '1720px' }}>
                {/* Left Controller - Positioned outside content area but inside container */}
                {carouselProducts.length > visibleCards && (
                  <button
                    onClick={goToPrevious}
                    className="absolute top-1/2 transform -translate-y-1/2 z-20"
                    style={{ 
                      width: '61px', 
                      height: '134px',
                      left: '-30px' // Half outside, half inside to stay visible
                    }}
                    aria-label="Previous products"
                  >
                    <div 
                      className="w-full h-full relative"
                      style={{ background: 'rgba(0, 0, 0, 0.13)', borderRadius: '61px' }}
                    >
                      <div 
                        className="absolute overflow-hidden"
                        style={{ width: '36px', height: '36px', left: '13px', top: '49px' }}
                      >
                        <div 
                          className="absolute flex items-center justify-center"
                          style={{ 
                            width: '30px', 
                            height: '30px', 
                            left: '3px', 
                            top: '3px', 
                            background: '#7C7C7C',
                            borderRadius: '50%'
                          }}
                        >
                          <FaChevronLeft className="w-3 h-3 text-black" />
                        </div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Visible window - Responsive grid with padding for controllers */}
                <div 
                  className={`grid gap-6 lg:gap-[18px] ${
                    variant === 'featured' 
                      ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4' 
                      : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                  }`}
                  style={{ 
                    maxWidth: '1720px',
                    paddingLeft: '40px',
                    paddingRight: '40px'
                  }}
                >
                  {carouselProducts.slice(currentIndex, currentIndex + visibleCards).map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      variant={variant}
                      ranking={showRanking ? currentIndex + index + 1 : undefined}
                      showDownloads={showDownloads}
                      showCommercialPrice={showCommercialInfo}
                      showFavorite={true}
                      className="w-full"
                    />
                  ))}
                </div>

                {/* Right Controller - Positioned outside content area but inside container */}
                {carouselProducts.length > visibleCards && (
                  <button
                    onClick={goToNext}
                    className="absolute top-1/2 transform -translate-y-1/2 z-20"
                    style={{ 
                      width: '61px', 
                      height: '134px',
                      right: '-30px' // Half outside, half inside to stay visible
                    }}
                    aria-label="Next products"
                  >
                    <div 
                      className="w-full h-full relative"
                      style={{ background: 'rgba(0, 0, 0, 0.13)', borderRadius: '61px' }}
                    >
                      <div 
                        className="absolute overflow-hidden"
                        style={{ width: '36px', height: '36px', left: '13px', top: '49px' }}
                      >
                        <div 
                          className="absolute flex items-center justify-center"
                          style={{ 
                            width: '30px', 
                            height: '30px', 
                            left: '3px', 
                            top: '3px', 
                            background: '#7C7C7C',
                            borderRadius: '50%'
                          }}
                        >
                          <FaChevronRight className="w-3 h-3 text-black" />
                        </div>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Standard Grid Layout */
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                variant={variant}
                ranking={showRanking ? index + 1 : undefined}
                showDownloads={showDownloads}
                showCommercialPrice={showCommercialInfo}
                showFavorite={variant === 'standard'}
              />
            ))}
          </div>
        )}
        
        {/* Additional content for commercial section */}
        {variant === 'commercial' && (
          <div className="mt-8 text-center">
            <div className="bg-cardbackground border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Need Commercial Rights?</h3>
              <p className="text-gray-400 text-sm mb-4">
                Use these models for your business, sell prints, or create derivative works with our commercial licenses.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Sell Physical Prints</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Commercial Projects</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Derivative Works</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
