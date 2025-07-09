'use client';

import { useState, useEffect } from 'react';
import { FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Link from 'next/link';
import ProductCard from '@/components/card/ProductCard';
import { ProductSectionProps } from '@/components/card/types';

export default function ProductSection({
  title,
  icon,
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
        if (width >= 1280) setVisibleCards(5);      // xl: 5 cards
        else if (width >= 1024) setVisibleCards(4); // lg: 4 cards
        else if (width >= 768) setVisibleCards(3);  // md: 3 cards
        else if (width >= 640) setVisibleCards(2);  // sm: 2 cards
        else setVisibleCards(1);                     // mobile: 1 card
      }
    };

    updateVisibleCards();
    window.addEventListener('resize', updateVisibleCards);
    return () => window.removeEventListener('resize', updateVisibleCards);
  }, []);
  
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
          bgClass: 'bg-primarybackground',
          iconColor: 'text-yellow-500'
        };
      case 'trending':
        return {
          bgClass: 'bg-primarybackground',
          iconColor: 'text-orange-500'
        };
      case 'commercial':
        return {
          bgClass: 'bg-primarybackground',
          iconColor: 'text-green-500'
        };
      default:
        return {
          bgClass: 'bg-primarybackground',
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`${sectionConfig.iconColor}`}>
                    {icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                    {description && (
                      <p className="text-gray-400 mt-1">{description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Carousel Navigation */}
                  {carouselProducts.length > visibleCards && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={goToPrevious}
                        className="p-2 rounded-full bg-cardbackground border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 transition-colors"
                        aria-label="Previous products"
                      >
                        <FaChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={goToNext}
                        className="p-2 rounded-full bg-cardbackground border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 transition-colors"
                        aria-label="Next products"
                      >
                        <FaChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {viewAllHref && (
                    <Link 
                      href={viewAllHref} 
                      className="flex items-center gap-2 text-primary hover:text-white transition-colors text-sm"
                    >
                      View All <FaArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Standard Header for non-carousel sections */
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className={`${sectionConfig.iconColor}`}>
                {icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                {description && (
                  <p className="text-gray-400 mt-1">{description}</p>
                )}
              </div>
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
          /* Carousel Layout - Responsive */
          <div className="flex justify-center">
            <div className="relative overflow-hidden w-full max-w-[1720px]">
              {/* Visible window - Responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-[30px]">
                {carouselProducts.slice(currentIndex, currentIndex + visibleCards).map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant={variant}
                    ranking={showRanking ? currentIndex + index + 1 : undefined}
                    showDownloads={showDownloads}
                    showCommercialPrice={showCommercialInfo}
                    showFavorite={false}
                    className="w-full"
                  />
                ))}
              </div>
              
              {/* Mobile swipe hint */}
              <div className="xl:hidden mt-4 text-center text-sm text-gray-400">
                Swipe or use arrows to see more
              </div>
            </div>
          </div>
        ) : (
          /* Standard Grid Layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
