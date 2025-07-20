'use client';

import { useState } from 'react';
import { FaTimes, FaChevronDown, FaChevronUp, FaFilter } from 'react-icons/fa';
import { useSearch } from '@/hooks/useSearch';
import type { SearchFilters as SearchFiltersType } from '@/lib/api/searchService';

interface SearchFiltersSidebarProps {
  className?: string;
  isMobile?: boolean;
}

export default function SearchFiltersSidebar({ className = "", isMobile = false }: SearchFiltersSidebarProps) {
  const { filters, updateFilters, resetFilters } = useSearch();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    sort: true,
    price: true,
    categories: true,
    ratings: false,
    license: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    updateFilters({
      priceRange: {
        ...filters.priceRange,
        [type]: value
      }
    });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    updateFilters({ categories: newCategories });
  };

  const handleRatingToggle = (rating: number) => {
    const newRatings = filters.ratings.includes(rating)
      ? filters.ratings.filter(r => r !== rating)
      : [...filters.ratings, rating];
    
    updateFilters({ ratings: newRatings });
  };

  const handleLicenseToggle = (license: 'personal' | 'commercial') => {
    const newLicenses = filters.licenseTypes.includes(license)
      ? filters.licenseTypes.filter(l => l !== license)
      : [...filters.licenseTypes, license];
    
    updateFilters({ licenseTypes: newLicenses });
  };

  const handleSortChange = (sortBy: SearchFiltersType['sortBy']) => {
    updateFilters({ sortBy });
  };

  const hasActiveFilters = () => {
    return (
      filters.priceRange.min > 0 ||
      filters.priceRange.max < 1000 ||
      filters.categories.length > 0 ||
      filters.ratings.length > 0 ||
      filters.licenseTypes.length > 0 ||
      filters.sortBy !== 'relevance'
    );
  };

  const categories = [
    'Fantasy', 'Sci-Fi', 'Medieval', 'Modern', 'Vehicles', 'Animals', 
    'Characters', 'Buildings', 'Weapons', 'Accessories'
  ];

  const ratings = [5, 4, 3, 2, 1];

  // Mobile version - Button that opens modal
  if (isMobile) {
    return (
      <div className={`relative ${className}`}>
        {/* Filter Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors w-full ${
            hasActiveFilters()
              ? 'bg-primary text-black border-primary'
              : 'bg-cardbackground text-gray-300 border-gray-700 hover:border-gray-600'
          }`}
        >
          <FaFilter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
          {hasActiveFilters() && (
            <span className="bg-black/20 text-xs px-1.5 py-0.5 rounded-full">
              {[
                filters.categories.length,
                filters.ratings.length,
                filters.licenseTypes.length,
                filters.priceRange.min > 0 || filters.priceRange.max < 1000 ? 1 : 0,
                filters.sortBy !== 'relevance' ? 1 : 0
              ].reduce((a, b) => a + b, 0)}
            </span>
          )}
          {isOpen ? <FaChevronUp className="w-3 h-3 ml-auto" /> : <FaChevronDown className="w-3 h-3 ml-auto" />}
        </button>

        {/* Mobile Filter Modal */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-cardbackground border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Filters</h3>
                <div className="flex items-center gap-2">
                  {hasActiveFilters() && (
                    <button
                      onClick={resetFilters}
                      className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter Content - Same as desktop but more compact */}
              <div className="space-y-6">
                {/* Sort By */}
                <div>
                  <button
                    onClick={() => toggleSection('sort')}
                    className="flex items-center justify-between w-full text-left text-white font-medium mb-3"
                  >
                    Sort By
                    {expandedSections.sort ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                  </button>
                  {expandedSections.sort && (
                    <div className="space-y-2">
                      {[
                        { value: 'relevance', label: 'Relevance' },
                        { value: 'newest', label: 'Newest' },
                        { value: 'popular', label: 'Most Popular' },
                        { value: 'price-low', label: 'Price: Low to High' },
                        { value: 'price-high', label: 'Price: High to Low' }
                      ].map(option => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="sort"
                            value={option.value}
                            checked={filters.sortBy === option.value}
                            onChange={() => handleSortChange(option.value as SearchFiltersType['sortBy'])}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-gray-300">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Range */}
                <div>
                  <button
                    onClick={() => toggleSection('price')}
                    className="flex items-center justify-between w-full text-left text-white font-medium mb-3"
                  >
                    Price Range
                    {expandedSections.price ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                  </button>
                  {expandedSections.price && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <input
                            type="number"
                            placeholder="Min"
                            value={filters.priceRange.min}
                            onChange={(e) => handlePriceChange('min', Number(e.target.value))}
                            className="w-full px-2 py-1 bg-primarybackground border border-gray-700 rounded text-white text-sm"
                          />
                        </div>
                        <span className="text-gray-400 text-sm">to</span>
                        <div className="flex-1">
                          <input
                            type="number"
                            placeholder="Max"
                            value={filters.priceRange.max}
                            onChange={(e) => handlePriceChange('max', Number(e.target.value))}
                            className="w-full px-2 py-1 bg-primarybackground border border-gray-700 rounded text-white text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Categories */}
                <div>
                  <button
                    onClick={() => toggleSection('categories')}
                    className="flex items-center justify-between w-full text-left text-white font-medium mb-3"
                  >
                    Categories
                    {expandedSections.categories ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                  </button>
                  {expandedSections.categories && (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {categories.map(category => (
                        <label key={category} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.categories.includes(category)}
                            onChange={() => handleCategoryToggle(category)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-gray-300">{category}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop version - Full sidebar
  return (
    <div className={`bg-cardbackground border border-gray-700 rounded-lg h-fit ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Filters</h3>
          {hasActiveFilters() && (
            <button
              onClick={resetFilters}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Sort By */}
        <div className="mb-8">
          <button
            onClick={() => toggleSection('sort')}
            className="flex items-center justify-between w-full text-left text-white font-medium mb-4"
          >
            Sort By
            {expandedSections.sort ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
          </button>
          {expandedSections.sort && (
            <div className="space-y-3">
              {[
                { value: 'relevance', label: 'Relevance' },
                { value: 'newest', label: 'Newest' },
                { value: 'popular', label: 'Most Popular' },
                { value: 'price-low', label: 'Price: Low to High' },
                { value: 'price-high', label: 'Price: High to Low' }
              ].map(option => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    value={option.value}
                    checked={filters.sortBy === option.value}
                    onChange={() => handleSortChange(option.value as SearchFiltersType['sortBy'])}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="mb-8">
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full text-left text-white font-medium mb-4"
          >
            Price Range
            {expandedSections.price ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
          </button>
          {expandedSections.price && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">Min Price</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.priceRange.min}
                    onChange={(e) => handlePriceChange('min', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-primarybackground border border-gray-700 rounded text-white text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">Max Price</label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={filters.priceRange.max}
                    onChange={(e) => handlePriceChange('max', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-primarybackground border border-gray-700 rounded text-white text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="text-xs text-gray-400 text-center">
                ${filters.priceRange.min} - ${filters.priceRange.max}
              </div>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="mb-8">
          <button
            onClick={() => toggleSection('categories')}
            className="flex items-center justify-between w-full text-left text-white font-medium mb-4"
          >
            Categories
            {expandedSections.categories ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
          </button>
          {expandedSections.categories && (
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {categories.map(category => (
                <label key={category} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-300">{category}</span>
                  {filters.categories.includes(category) && (
                    <span className="ml-auto text-xs bg-primary text-black px-1.5 py-0.5 rounded">
                      ✓
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Ratings */}
        <div className="mb-8">
          <button
            onClick={() => toggleSection('ratings')}
            className="flex items-center justify-between w-full text-left text-white font-medium mb-4"
          >
            Minimum Rating
            {expandedSections.ratings ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
          </button>
          {expandedSections.ratings && (
            <div className="space-y-3">
              {ratings.map(rating => (
                <label key={rating} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.ratings.includes(rating)}
                    onChange={() => handleRatingToggle(rating)}
                    className="text-primary focus:ring-primary"
                  />
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-300">& up</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* License Types */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('license')}
            className="flex items-center justify-between w-full text-left text-white font-medium mb-4"
          >
            License Type
            {expandedSections.license ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
          </button>
          {expandedSections.license && (
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.licenseTypes.includes('personal')}
                  onChange={() => handleLicenseToggle('personal')}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-300">Personal Use</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.licenseTypes.includes('commercial')}
                  onChange={() => handleLicenseToggle('commercial')}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-300">Commercial Use</span>
              </label>
            </div>
          )}
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters() && (
          <div className="pt-4 border-t border-gray-700">
            <h4 className="text-sm font-medium text-white mb-3">Active Filters</h4>
            <div className="space-y-2">
              {filters.sortBy !== 'relevance' && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Sort:</span>
                  <span className="text-primary">{filters.sortBy}</span>
                </div>
              )}
              {(filters.priceRange.min > 0 || filters.priceRange.max < 1000) && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Price:</span>
                  <span className="text-primary">${filters.priceRange.min}-${filters.priceRange.max}</span>
                </div>
              )}
              {filters.categories.length > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Categories:</span>
                  <span className="text-primary">{filters.categories.length} selected</span>
                </div>
              )}
              {filters.ratings.length > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Ratings:</span>
                  <span className="text-primary">{filters.ratings.length} selected</span>
                </div>
              )}
              {filters.licenseTypes.length > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">License:</span>
                  <span className="text-primary">{filters.licenseTypes.length} selected</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
