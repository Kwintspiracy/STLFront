'use client';

import { useState } from 'react';
import SearchBar from '@/components/search/SearchBar';
import { FaSearch } from 'react-icons/fa';
import { useSearch } from '@/hooks/useSearch';

interface SearchSectionProps {
  isVisible: boolean;
  className?: string;
}

export default function SearchSection({ isVisible, className = "" }: SearchSectionProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  
  const {
    elements,
    input,
    suggestions,
    handleInputChange,
    handleTagAdd,
    handleTagRemove,
    handleKeyDown,
    executeSearch
  } = useSearch();

  if (!isVisible) {
    return (
      <button 
        className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
        onClick={() => setSearchFocused(!searchFocused)}
        aria-label="Toggle search"
      >
        <FaSearch className="w-4 h-4" />
      </button>
    );
  }

  return (
    <>
      {/* Desktop Search */}
      <div className={`hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-full max-w-lg ${className}`}>
        <SearchBar
          elements={elements}
          input={input}
          onInputChange={handleInputChange}
          onTagAdd={handleTagAdd}
          onTagRemove={handleTagRemove}
          onKeyDown={handleKeyDown}
          suggestions={suggestions}
          onSearch={executeSearch}
        />
      </div>

      {/* Mobile Search Toggle */}
      <button 
        className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
        onClick={() => setSearchFocused(!searchFocused)}
        aria-label="Toggle search"
      >
        <FaSearch className="w-4 h-4" />
      </button>

      {/* Mobile Search Bar */}
      {searchFocused && (
        <div className="md:hidden absolute top-full left-0 right-0 border-t border-gray-700/50 p-4 bg-primarybackground">
          <SearchBar
            elements={elements}
            input={input}
            onInputChange={handleInputChange}
            onTagAdd={handleTagAdd}
            onTagRemove={handleTagRemove}
            onKeyDown={handleKeyDown}
            suggestions={suggestions}
            onSearch={executeSearch}
          />
        </div>
      )}
    </>
  );
}
