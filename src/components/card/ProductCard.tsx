'use client';

import { RiImageLine, RiDownloadLine } from "react-icons/ri";
import { FaShoppingCart, FaHeart } from "react-icons/fa";
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { BaseProductCardProps } from './types';
import DefaultAvatar from '@/components/ui/DefaultAvatar';
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
  variant = 'standard',
  loading = false,
  ranking,
  showDownloads = false,
  showCommercialPrice = false,
  showFavorite = false,
  className = ""
}: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { addToCart } = useCart();

  const sortedImages = [...product.images].sort((a, b) => a.rank - b.rank);
  const mainImage = sortedImages[0]?.url || sortedImages[0]?.image; // Support both new and legacy format

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 'personal');
  };

  // Get variant-specific styles and content
  const getVariantConfig = () => {
    switch (variant) {
      case 'featured':
        return {
          badgeText: 'FEATURED',
          badgeColor: 'bg-yellow-500 text-black',
          hoverBorder: 'hover:border-yellow-500/50',
          accentColor: 'text-yellow-500'
        };
      case 'trending':
        return {
          badgeText: ranking ? `#${ranking}` : 'TRENDING',
          badgeColor: 'bg-orange-500 text-white',
          hoverBorder: 'hover:border-orange-500/50',
          accentColor: 'text-orange-500'
        };
      case 'commercial':
        return {
          badgeText: 'COMMERCIAL',
          badgeColor: 'bg-green-500 text-black',
          hoverBorder: 'hover:border-green-500/50',
          accentColor: 'text-green-500'
        };
      default:
        return {
          badgeText: null,
          badgeColor: '',
          hoverBorder: 'hover:border-gray-700',
          accentColor: 'text-primary'
        };
    }
  };

  const variantConfig = getVariantConfig();

  if (loading) {
    return (
      <div className={`w-full max-w-xl ${className}`}>
        {/* Skeleton Card */}
        <div className="bg-cardbackground overflow-hidden flex flex-col rounded-lg pb-2 border border-gray-800">
          {/* Image skeleton */}
          <div className="relative w-full aspect-square overflow-hidden bg-gray-800 animate-pulse">
            <div className="w-full h-full bg-gray-700"></div>
          </div>

          {/* Content skeleton */}
          <div className="px-4 pt-2 pb-4 space-y-2">
            {/* Title skeleton */}
            <div className="h-6 bg-gray-700 rounded animate-pulse"></div>

            {/* Creator info skeleton */}
            <div className="flex items-center gap-3 pb-3">
              <div className="w-6 h-6 rounded-full bg-gray-700 animate-pulse"></div>
              <div className="h-4 bg-gray-700 rounded w-20 animate-pulse"></div>
            </div>

            {/* Price and button skeleton */}
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-700 rounded w-16 animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative group w-full transition-transform duration-300 ease-in-out hover:-translate-y-1 ${className.includes('max-w-') ? className : `max-w-xl ${className}`}`}>
      {/* Border gradient wrapper for featured cards */}
      {variant === 'featured' && (
        <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-b from-primarybackground via-primary to-primarybackground opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 pointer-events-none" />
      )}

      {/* Main card content */}
      <div className={`relative z-10 bg-cardbackground overflow-hidden flex flex-col rounded-lg pb-2 border border-gray-800 ${variantConfig.hoverBorder} transition-colors`}>

        {/* Image Section */}
        <Link href={`/product/${product.id}`} className="block relative">
          <div className="relative w-full aspect-square overflow-hidden bg-gray-800">
            {/* Loading skeleton */}
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
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
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={`object-cover transition-all duration-500 group-hover:scale-105 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <RiImageLine className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <span className="text-sm">No image</span>
                </div>
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Badge overlay */}
            {variantConfig.badgeText && (
              <div className="absolute top-2 left-2">
                <span className={`${variantConfig.badgeColor} text-xs font-bold px-2 py-1 rounded`}>
                  {variantConfig.badgeText}
                </span>
              </div>
            )}

            {/* Top-right overlays */}
            <div className="absolute top-2 right-2 flex flex-col gap-2">
              {/* Download count for trending */}
              {showDownloads && (
                <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-white">{((product.id * 37) % 500) + 100}</span>
                </div>
              )}

              {/* Commercial license price */}
              {showCommercialPrice && parseFloat(product.professional_license_fee) > 0 && (
                <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                  <span className="text-xs text-white">License: $</span>
                  <span className="text-xs text-green-400 font-bold">{parseFloat(product.professional_license_fee).toFixed(0)}</span>
                </div>
              )}

              {/* Favorite button for standard cards */}
              {showFavorite && (
                <button className="p-1.5 bg-black/50 backdrop-blur-sm rounded-full hover:bg-red-500/50 transition-colors">
                  <FaHeart className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
          </div>
        </Link>

        {/* Content Section */}
        <div className="px-4 pt-2 pb-4 space-y-2">

          {/* Product Title - Clickable */}
          <Link href={`/product/${product.id}`}>
            <h3 className="text-base sm:text-lg font-semibold tracking-tight truncate pb-3 pt-1 hover:text-primary transition-colors duration-200">
              {product.name}
            </h3>
          </Link>

          {/* Studio Info */}
          <div className="flex items-center gap-3 pb-1 text-sm sm:text-base text-stone-400">
            <div className="relative flex-shrink-0">
              {/* Check if studio has a badge */}
              {product.creator.badge ? (
                <Image
                  src={product.creator.badge}
                  alt={`${product.creator.name} badge`}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-gray-600/50"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <DefaultAvatar className="ring-2 ring-gray-600/50" size={32} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-300 font-medium truncate">
                {product.creator.name}
              </p>
              <p className="text-xs text-gray-500">
                Studio
              </p>
            </div>
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col">
              {parseFloat(product.price) === 0 ? (
                <span className="text-xl font-bold text-green-400">
                  FREE
                </span>
              ) : (
                <span className="text-xl font-bold text-primary">
                  ${product.price}
                </span>
              )}
              {showCommercialPrice && parseFloat(product.price) > 0 && (
                <span className="text-xs text-gray-500">Personal Use</span>
              )}
              {!showCommercialPrice && parseFloat(product.price) > 0 && (
                <span className="text-xs text-gray-500">USD</span>
              )}
              {parseFloat(product.price) === 0 && (
                <span className="text-xs text-green-400">Download</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {parseFloat(product.price) === 0 ? (
                <button className="bg-green-500 text-black px-3 py-1.5 rounded text-sm font-medium hover:bg-green-600 transition-colors flex items-center gap-2">
                  <RiDownloadLine className="w-4 h-4" />
                  <span className="hidden sm:inline">Free</span>
                </button>
              ) : (
                <button 
                  onClick={handleAddToCart}
                  className="bg-primary text-black px-3 py-1.5 rounded text-sm font-medium hover:bg-[#3f6061] hover:text-secondary transition-colors flex items-center gap-2"
                >
                  <FaShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">Add</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
