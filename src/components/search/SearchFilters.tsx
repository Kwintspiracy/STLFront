'use client';

import { useState } from 'react';
import { FaFilter, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useSearch } from '@/hooks/useSearch';
import type { SearchFilters as SearchFiltersType } from '@/lib/api/searchService';

interface SearchFiltersProps {
  className?: string;
}

export default function SearchFilters({ className = "" }: SearchFiltersProps) {
  const { filters, updateFilters, resetFilters } = useSearch();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    categories: false,
    ratings: false,
    license: false,
    sort: true
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

  return (
    <div className={`relative ${className}`}>
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
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
        {isOpen ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-cardbackground border border-gray-700 rounded-lg shadow-xl z-50">
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

            {/* Sort By */}
            <div className="mb-6">
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
            <div className="mb-6">
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
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange.min}
                      onChange={(e) => handlePriceChange('min', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-primarybackground border border-gray-700 rounded text-white text-sm"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange.max}
                      onChange={(e) => handlePriceChange('max', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-primarybackground border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                  <div className="text-xs text-gray-400">
                    ${filters.priceRange.min} - ${filters.priceRange.max}
                  </div>
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('categories')}
                className="flex items-center justify-between w-full text-left text-white font-medium mb-3"
              >
                Categories
                {expandedSections.categories ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
              </button>
              {expandedSections.categories && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
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

            {/* Ratings */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('ratings')}
                className="flex items-center justify-between w-full text-left text-white font-medium mb-3"
              >
                Minimum Rating
                {expandedSections.ratings ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
              </button>
              {expandedSections.ratings && (
                <div className="space-y-2">
                  {ratings.map(rating => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.ratings.includes(rating)}
                        onChange={() => handleRatingToggle(rating)}
                        className="text-primary focus:ring-primary"
                      />
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="text-sm text-gray-300 ml-1">& up</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* License Types */}
            <div className="mb-4">
              <button
                onClick={() => toggleSection('license')}
                className="flex items-center justify-between w-full text-left text-white font-medium mb-3"
              >
                License Type
                {expandedSections.license ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
              </button>
              {expandedSections.license && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.licenseTypes.includes('personal')}
                      onChange={() => handleLicenseToggle('personal')}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-300">Personal Use</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
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
          </div>
        </div>
      )}
    </div>
  );
}
