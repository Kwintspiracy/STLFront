'use client';

import { RiImageLine } from "react-icons/ri";
import { FaHeart, FaRegHeart, FaCheck, FaShoppingCart } from "react-icons/fa";
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { BaseProductCardProps } from './types';
import { useCart } from '@/context/CartContext';
interface ProductCardProps extends BaseProductCardProps {
  loading?: boolean;
  ranking?: number;
  showDownloads?: boolean;
  showCommercialPrice?: boolean;
  showFavorite?: boolean;
}

export default function ProductCard({ 
  product, 
  loading = false,
  showFavorite = true,
  className = ""
}: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();

  const sortedImages = [...product.images].sort((a, b) => a.rank - b.rank);
  const mainImage = sortedImages[0]?.url || sortedImages[0]?.image;

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAddingToCart) return;
    
    setIsAddingToCart(true);
    addToCart(product, 'personal');
    
    // Reset after 2 seconds
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className={className}>
        <div className="bg-white/5 rounded-[16px] overflow-hidden animate-pulse">
          <div className="relative w-full aspect-square bg-[#242627]">
            <div className="w-full h-full bg-gray-700"></div>
          </div>
          <div className="p-4 pt-4 pb-6 space-y-3">
            <div className="h-6 bg-gray-700 rounded"></div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-700 rounded-md"></div>
              <div className="space-y-1">
                <div className="h-4 bg-gray-700 rounded w-20"></div>
                <div className="h-3 bg-gray-700 rounded w-12"></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-7 bg-gray-700 rounded w-16"></div>
              <div className="h-8 w-24 bg-gray-700 rounded-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`group transition-all duration-300 ease-in-out hover:-translate-y-2 ${className}`}>
      <div className="bg-white/5 rounded-[16px] overflow-hidden transition-all duration-300">
        
        {/* Image Section */}
        <Link href={`/product/${product.id}`} className="block relative">
          <div className="relative w-full aspect-square bg-[#242627] rounded-t-[16px] overflow-hidden">
            {/* Loading skeleton */}
            {imageLoading && (
              <div className="absolute inset-0 bg-[#242627] animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 text-gray-600">
                  <RiImageLine className="w-full h-full" />
                </div>
              </div>
            )}

            {/* Main image */}
            {mainImage && !imageError ? (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                sizes="300px"
                className={`object-cover transition-all duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full bg-[#242627] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <RiImageLine className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <span className="text-sm">No image</span>
                </div>
              </div>
            )}

            {/* Heart Button */}
            {showFavorite && (
              <button 
                onClick={handleFavoriteClick}
                className={`absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl cursor-pointer transition-all duration-300 backdrop-blur-[10px] border-none hover:scale-110 ${
                  isFavorited 
                    ? 'bg-red-500/80 hover:bg-red-600/80' 
                    : 'bg-black/30 hover:bg-white/20'
                }`}
                aria-label="Add to favorites"
              >
                {isFavorited ? <FaHeart /> : <FaRegHeart />}
              </button>
            )}
          </div>
        </Link>

        {/* Product Information */}
        <div className="px-3 sm:px-5 pt-3 xs:pt-4 sm:pt-5 pb-4 sm:pb-5">
          {/* Product Title */}
          <Link href={`/product/${product.id}`}>
            <h2 className="text-[#F4F4F4] text-sm xs:text-base sm:text-lg lg:text-xl font-light leading-[1.3] mb-3 xs:mb-4 sm:mb-2.5 truncate hover:text-primary transition-colors duration-200">
              {product.name}
            </h2>
          </Link>

          {/* Creator Section */}
          <div className="flex items-start mb-3 xs:mb-4 sm:mb-6">
            <div className="w-10 h-10 xs:w-10 xs:h-10 sm:w-12 sm:h-12 flex-shrink-0">
              {product.creator.badge ? (
                <div className="w-full h-full bg-[#242627] border-2 border-white/5 rounded-lg overflow-hidden">
                  <Image
                    src={product.creator.badge}
                    alt={`${product.creator.name} avatar`}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-gray-700 border-2 border-white/5 rounded-lg flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400"
                    viewBox="0 0 48 48" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="24" cy="18" r="6" fill="currentColor"/>
                    <path d="M12 36c0-6.627 5.373-12 12-12s12 5.373 12 12v4H12v-4z" fill="currentColor"/>
                  </svg>
                </div>
              )}
            </div>
            <div className="ml-2 sm:ml-2 flex flex-col pt-0">
              <div className="text-[#F4F4F4] text-sm sm:text-base font-regular mb-0 whitespace-nowrap overflow-hidden text-ellipsis">
              {product.creator.name}
              </div>
              <div className="text-[#969696] text-xs sm:text-sm font-regular">
                Studio
              </div>
            </div>
          </div>

          {/* Price Section */}
          <div className="flex justify-between items-center">
            <div className="text-[#F4F4F4] text-lg sm:text-xl font-semibold">
              {parseFloat(product.price) === 0 ? 'FREE' : `$${product.price}`}
            </div>
            
            <button 
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className={`px-4 py-2.5 rounded-3xl flex items-center justify-center gap-2.5 border-none cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${
                isAddingToCart 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-[#324FEE] hover:bg-[#2940d9]'
              }`}
              aria-label="Add to cart"
            >
              {isAddingToCart ? (
                <>
                  <FaCheck className="text-white text-base" />
                  <span className="hidden sm:inline text-white text-base font-medium leading-4">
                    Added!
                  </span>
                </>
              ) : (
                <>
                  <FaShoppingCart className="text-white text-base sm:hidden" />
                  <span className="hidden sm:inline text-white text-base font-medium leading-4">
                    Add to Cart
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
