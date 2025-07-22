'use client';

import { useSearch } from '@/hooks/useSearch';
import ProductCard from '@/components/card/ProductCard';
import { FaSpinner, FaExclamationTriangle, FaSearch } from 'react-icons/fa';

interface SearchResultsProps {
  className?: string;
}

export default function SearchResults({ className = "" }: SearchResultsProps) {
  const {
    elements,
    results,
    isLoading,
    error,
    totalResults,
    currentPage,
    resultsPerPage,
    setCurrentPage,
    getSearchQuery
  } = useSearch();

  const totalPages = Math.ceil(totalResults / resultsPerPage);

  // Loading state
  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="flex flex-col items-center justify-center py-16">
          <FaSpinner className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-gray-400">Searching for products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${className}`}>
        <div className="flex flex-col items-center justify-center py-16">
          <FaExclamationTriangle className="w-8 h-8 text-red-500 mb-4" />
          <p className="text-white font-medium mb-2">Search Error</p>
          <p className="text-gray-400 text-center">{error}</p>
        </div>
      </div>
    );
  }

  // No search query - show instruction or all products
  const searchQuery = getSearchQuery();
  if (!searchQuery.trim() && elements.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="flex flex-col items-center justify-center py-16">
          <FaSearch className="w-8 h-8 text-gray-500 mb-4" />
          <p className="text-white font-medium mb-2">Start Your Search</p>
          <p className="text-gray-400 text-center">
            Enter keywords or select tags to find the perfect 3D models
          </p>
        </div>
      </div>
    );
  }

  // No results
  if (results.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="flex flex-col items-center justify-center py-16">
          <FaSearch className="w-8 h-8 text-gray-500 mb-4" />
          <p className="text-white font-medium mb-2">No Results Found</p>
          <p className="text-gray-400 text-center mb-4">
            No products match your search for &quot;{searchQuery}&quot;
          </p>
          <div className="text-sm text-gray-500 text-center">
            <p>Try:</p>
            <ul className="mt-2 space-y-1">
              <li>• Using different keywords</li>
              <li>• Checking your spelling</li>
              <li>• Using fewer filters</li>
              <li>• Browsing popular categories</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Results Grid - Aligned with filter sidebar top */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {results.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            variant="featured"
            showFavorite={true}
            className="w-full max-w-none" // Ensure full width
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          {/* Previous Button */}
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === 1
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-cardbackground text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Previous
          </button>

          {/* Page Numbers */}
          {(() => {
            const pages = [];
            const showPages = 5;
            let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
            const endPage = Math.min(totalPages, startPage + showPages - 1);

            // Adjust start page if we're near the end
            if (endPage - startPage < showPages - 1) {
              startPage = Math.max(1, endPage - showPages + 1);
            }

            // First page
            if (startPage > 1) {
              pages.push(
                <button
                  key={1}
                  onClick={() => setCurrentPage(1)}
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-cardbackground text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  1
                </button>
              );
              if (startPage > 2) {
                pages.push(
                  <span key="ellipsis1" className="px-2 text-gray-500">
                    ...
                  </span>
                );
              }
            }

            // Page range
            for (let i = startPage; i <= endPage; i++) {
              pages.push(
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    i === currentPage
                      ? 'bg-primary text-black'
                      : 'bg-cardbackground text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {i}
                </button>
              );
            }

            // Last page
            if (endPage < totalPages) {
              if (endPage < totalPages - 1) {
                pages.push(
                  <span key="ellipsis2" className="px-2 text-gray-500">
                    ...
                  </span>
                );
              }
              pages.push(
                <button
                  key={totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-cardbackground text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  {totalPages}
                </button>
              );
            }

            return pages;
          })()}

          {/* Next Button */}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === totalPages
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-cardbackground text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Results per page info */}
      <div className="text-center mt-4">
        <p className="text-xs text-gray-500">
          Showing {resultsPerPage} results per page
        </p>
      </div>
    </div>
  );
}
