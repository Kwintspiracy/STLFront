'use client';

import { FaArrowRight, FaHeart, FaShoppingCart } from "react-icons/fa";
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Product } from "@/types/product";
import { RiImageLine } from "react-icons/ri";

interface LatestSectionProps {
  products: Product[];
  className?: string;
}

export default function LatestSection({ products, className = "" }: LatestSectionProps) {
  return (
    <div className={`bg-primarybackground ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Latest Additions</h2>
            <p className="text-gray-400 mt-1">Fresh models from our community</p>
          </div>
          <Link 
            href="/latest" 
            className="flex items-center gap-2 text-primary hover:text-white transition-colors text-sm"
          >
            View All <FaArrowRight className="w-3 h-3" />
          </Link>
        </div>
        
        {/* Compact grid for latest products */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {products.map((product) => (
            <LatestProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LatestProductCard({ product }: { product: Product }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const sortedImages = [...product.images].sort((a, b) => a.rank - b.rank);
  const mainImage = sortedImages[0]?.url || sortedImages[0]?.image; // Support both new and legacy format

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <div className="bg-cardbackground border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors group">
      {/* Image Section */}
      <Link href={`/product/${product.id}`} className="block relative">
        <div className="aspect-square relative overflow-hidden">
          {/* Loading skeleton */}
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
              <div className="w-6 h-6 text-gray-600">
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
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
              className={`object-cover group-hover:scale-105 transition-transform duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <RiImageLine className="w-8 h-8 mx-auto mb-1 opacity-50" />
                <span className="text-xs">No image</span>
              </div>
            </div>
          )}

          {/* Favorite button */}
          <div className="absolute top-2 right-2">
            <button className="p-1.5 bg-black/50 backdrop-blur-sm rounded-full hover:bg-red-500/50 transition-colors">
              <FaHeart className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-3">
        {/* Product Title - Clickable */}
        <Link href={`/product/${product.id}`}>
          <h3 className="font-medium text-white text-sm truncate hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-xs text-gray-400 mt-1">by {product.creator.name}</p>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-primary">${product.price}</span>
          <button className="bg-primary text-black px-2 py-1 rounded text-xs font-medium hover:bg-[#3f6061] hover:text-secondary transition-colors flex items-center gap-1">
            <FaShoppingCart className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
