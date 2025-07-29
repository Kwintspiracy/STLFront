'use client';

import { useState, useEffect } from 'react';
import { FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Link from 'next/link';
import ProductCard from '@/components/card/ProductCard';
import { Product } from '@/types/product';

interface StudioProductsCarouselProps {
  products: Product[];
  studioName: string;
  studioId: number;
}

export default function StudioProductsCarousel({ products, studioName, studioId }: StudioProductsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(5);
  const [screenWidth, setScreenWidth] = useState(1280);
  
  const maxProducts = 20;
  const carouselProducts = products.slice(0, maxProducts);
  
  // Update visible cards based on screen size
  useEffect(() => {
    const updateVisibleCards = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        setScreenWidth(width);
        if (width >= 2560) setVisibleCards(5);      // 4xl: 5 cards
        else if (width >= 1920) setVisibleCards(6); // 3xl: 6 cards
        else if (width >= 1536) setVisibleCards(5); // 2xl: 5 cards
        else if (width >= 1280) setVisibleCards(4); // xl: 4 cards
        else if (width >= 1024) setVisibleCards(3); // lg: 3 cards
        else if (width >= 768) setVisibleCards(3);  // md: 3 cards
        else if (width >= 640) setVisibleCards(2);  // sm: 2 cards
        else if (width >= 430) setVisibleCards(2);  // xs: 2 cards
        else setVisibleCards(6);                     // mobile: 6 cards (3 rows x 2 cols)
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
    <div className="bg-transparent">
      <div className="max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section Header - Same style as homepage */}
        <div className="flex justify-center mb-5 sm:mb-6 mt-5 sm:mt-8">
          <div className="w-full text-left max-w-wide">
            <div className="px-4 sm:px-0" style={{ paddingLeft: '0px', paddingRight: '0px' }}>
              <div style={{ paddingLeft: '0px', paddingRight: '0px' }} className="sm:hidden">
                <h2 className="text-3xl font-extrabold">
                  <span className="text-primary">MORE FROM</span>
                  <span className="text-white"> {studioName?.toUpperCase()}</span>
                </h2>
              </div>
              <div style={{ paddingLeft: '40px', paddingRight: '40px' }} className="hidden sm:block">
                <h2 className="text-4xl font-extrabold">
                  <span className="text-primary">MORE FROM</span>
                  <span className="text-white"> {studioName?.toUpperCase()}</span>
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Products Display - Same carousel style as homepage */}
        {/* Mobile: Fixed Grid */}
        <div className="sm:hidden">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {carouselProducts.slice(0, 6).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="featured"
                showFavorite={true}
                className="w-full"
              />
            ))}
          </div>
          {/* Mobile View All Button */}
          <Link 
            href={`/public/studio/${studioId}`}
            className="w-full bg-primary text-black py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
          >
            View All <FaArrowRight className="w-4 h-4" />
          </Link>
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

            {/* Visible window - Flexbox layout to prevent wrapping */}
            <div 
              className="flex gap-6 lg:gap-[18px]"
              style={{ 
                maxWidth: '1720px',
                paddingLeft: '40px',
                paddingRight: '40px'
              }}
            >
              {carouselProducts.slice(currentIndex, currentIndex + visibleCards).map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0"
                  style={{ 
                    width: `calc((100% - ${(visibleCards - 1) * (screenWidth >= 1024 ? 18 : 24)}px) / ${visibleCards})` 
                  }}
                >
                  <ProductCard
                    product={product}
                    variant="featured"
                    showFavorite={true}
                    className="w-full"
                  />
                </div>
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
      </div>
    </div>
  );
}
