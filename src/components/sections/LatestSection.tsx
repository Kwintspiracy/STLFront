'use client';

import { useState } from 'react';
import { Product } from "@/types/product";
import ProductCard from '@/components/card/ProductCard';

interface LatestSectionProps {
  products: Product[];
  className?: string;
  rowsPerLoad?: number;
}

export default function LatestSection({ 
  products, 
  className = "",
  rowsPerLoad = 5 
}: LatestSectionProps) {
  const [visibleRows, setVisibleRows] = useState(rowsPerLoad);
  
  // Calculate products per row (5 products per row like carousel)
  const productsPerRow = 5;
  const totalProducts = visibleRows * productsPerRow;
  const visibleProducts = products.slice(0, totalProducts);
  const hasMore = products.length > totalProducts;

  const loadMore = () => {
    setVisibleRows(prev => prev + rowsPerLoad);
  };

  return (
    <div className={`bg-transparent ${className}`}>
      <div className="max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Section Header - Responsive like other sections */}
        <div className="flex justify-center mb-3 sm:mb-8">
          <div className="w-full text-left" style={{ maxWidth: '1720px' }}>
            <div className="px-4 sm:px-0" style={{ paddingLeft: '0px', paddingRight: '0px' }}>
              <div style={{ paddingLeft: '0px', paddingRight: '0px' }} className="sm:hidden">
                <h2 className="text-3xl font-extrabold">
                  <span className="text-[#FFD700]">LATEST</span>
                  <span className="text-white"> ADDITIONS</span>
                </h2>
                <p className="text-gray-400 mt-1 text-base">Fresh models from our community</p>
              </div>
              <div style={{ paddingLeft: '40px', paddingRight: '40px' }} className="hidden sm:block">
                <h2 className="text-4xl font-extrabold">
                  <span className="text-[#FFD700]">LATEST</span>
                  <span className="text-white"> ADDITIONS</span>
                </h2>
                <p className="text-gray-400 mt-1 text-xl">Fresh models from our community</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Products Grid - Responsive layout like other sections */}
        <div className="flex justify-center">
          <div className="w-full" style={{ maxWidth: '1720px' }}>
            <div className="px-4 sm:px-0" style={{ paddingLeft: '0px', paddingRight: '0px' }}>
              <div style={{ paddingLeft: '0px', paddingRight: '0px' }} className="sm:hidden">
                <div className="grid gap-3 grid-cols-2">
                  {visibleProducts.slice(0, 6).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      variant="standard"
                      showFavorite={true}
                      className="w-full"
                    />
                  ))}
                </div>
              </div>
              <div style={{ paddingLeft: '40px', paddingRight: '40px' }} className="hidden sm:block">
                <div className="grid gap-6 lg:gap-[18px] grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6">
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      variant="standard"
                      showFavorite={true}
                      className="w-full"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-12">
            <button
              onClick={loadMore}
              className="px-8 py-3 bg-primary text-black rounded-lg font-medium hover:bg-primary-hover transition-colors text-lg"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
