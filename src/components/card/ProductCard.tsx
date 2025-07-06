'use client';

import { Product } from "@/types/product";
import { RiImageLine } from "react-icons/ri";
import { TbShoppingCartPlus } from "react-icons/tb";
import CardCartButton from './CardCartButton';
import Link from 'next/link';
import { useState } from 'react'

interface ProductCardProps {
  product: Product;
  loading?: boolean;
}

export default function ProductCard({ product, loading = false }: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const sortedImages = [...product.images].sort((a, b) => a.rank - b.rank);
  const mainImage = sortedImages[0]?.url;

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  if (loading) {
    return (
      <div className="w-full max-w-xl">
        {/* Skeleton Card */}
        <div className="bg-cardbackground overflow-hidden flex flex-col rounded-md pb-2 border border-gray-800">
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
    <div className="relative group w-full max-w-xl transition-transform duration-300 ease-in-out hover:-translate-y-1">
      {/* Border gradient wrapper - restored original effect */}
      <div className="absolute -inset-0.5 rounded-md bg-gradient-to-b from-primarybackground via-primary to-primarybackground opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 pointer-events-none" />

      {/* Main card content */}
      <div className="relative z-10 bg-cardbackground overflow-hidden flex flex-col rounded-md pb-2 border border-gray-800">

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
              <img
                src={mainImage}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
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

            {/* Tags overlay */}

          </div>
        </Link>

        {/* Content Section */}
        <div className="px-4 pt-2 pb-4 space-y-2">

          {/* Product Title */}
          <Link href={`/product/${product.id}`}>
            <h3 className="text-base sm:text-lg font-semibold tracking-tight truncate pb-3 pt-1 hover:text-primary transition-colors duration-200">
              {product.name}
            </h3>
          </Link>

          {/* Creator Info */}
          <div className="flex items-center gap-3 pb-1 text-sm sm:text-base text-stone-400">
            <div className="relative flex-shrink-0">
              {product.creator.creatorlogo ? (
                <img
                  src={product.creator.creatorlogo}
                  alt={`${product.creator.name} logo`}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-gray-600/50"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-300">
                    {product.creator.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-300 font-medium truncate">
                {product.creator.name}
              </p>
              <p className="text-xs text-gray-500">
                Creator
              </p>
            </div>
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary">
                ${product.price}
              </span>
              <span className="text-xs text-gray-500">
                USD
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CardCartButton
                href={`/product/${product.id}`}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium"
              >
                <TbShoppingCartPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </CardCartButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
