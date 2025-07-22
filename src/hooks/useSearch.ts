'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, allTags } from '@/data/mock-tags';
import { Product } from '@/types/product';
import { searchProducts } from '@/lib/api/searchService';
import type { SearchElement, SearchFilters } from '@/lib/api/searchService';

// Re-export types for convenience
export type { SearchElement, SearchFilters };

// Initial filters
const initialFilters: SearchFilters = {
  priceRange: { min: 0, max: 1000 },
  categories: [],
  ratings: [],
  licenseTypes: [],
  sortBy: 'relevance'
};

// Custom hook for search functionality
export function useSearch() {
  const [elements, setElements] = useState<SearchElement[]>([]);
  const [input, setInput] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 20;
  const [shouldExecuteSearch, setShouldExecuteSearch] = useState(false);

  const router = useRouter();

  // Load search history from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('searchHistory');
      if (savedHistory) {
        try {
          const history = JSON.parse(savedHistory);
          setSearchHistory(history);
        } catch (error) {
          console.error('Error loading search history:', error);
        }
      }
    }
  }, []);

  // Save search history to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  // Load search from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tags = urlParams.get('tags');
      const terms = urlParams.get('terms');
      
      if (tags || terms) {
        const newElements: SearchElement[] = [];
        
        if (tags) {
          tags.split(',').forEach(tagName => {
            const tag = allTags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
            if (tag) {
              newElements.push({ type: 'tag', value: tag });
            }
          });
        }
        
        if (terms) {
          terms.split(',').forEach(term => {
            newElements.push({ type: 'text', value: term });
          });
        }
        
        if (newElements.length > 0) {
          setElements(newElements);
          setShouldExecuteSearch(true);
        }
      }
    }
  }, []);

  // Suggestions
  const updateSuggestions = useCallback((inputText: string) => {
    if (inputText.trim() === '') {
      setSuggestions([]);
      return;
    }

    const filteredSuggestions = allTags.filter(tag =>
      tag.name.toLowerCase().startsWith(inputText.toLowerCase()) &&
      !elements.some(el => el.type === 'tag' && el.value.id === tag.id)
    ).slice(0, 5);

    setSuggestions(filteredSuggestions);
  }, [elements]);

  // Input management
  const handleInputChange = useCallback((text: string) => {
    setInput(text);
    updateSuggestions(text);
  }, [updateSuggestions]);

  // Element management
  const addElement = useCallback((element: SearchElement) => {
    setElements(prev => [...prev, element]);
    setInput('');
    setSuggestions([]);
  }, []);

  const addElementAndSearch = useCallback((element: SearchElement) => {
    setElements(prev => [...prev, element]);
    setInput('');
    setSuggestions([]);
    setShouldExecuteSearch(true);
  }, []);

  const removeElement = useCallback((type: string, id?: number, value?: string) => {
    setElements(prev => prev.filter(el => {
      if (type === 'tag' && el.type === 'tag') {
        return el.value.id !== id;
      }
      if (type === 'text' && el.type === 'text') {
        return el.value !== value;
      }
      return true;
    }));
  }, []);

  const clearElements = useCallback(() => {
    setElements([]);
    setInput('');
    setSuggestions([]);
  }, []);

  // Filter management
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
    // Trigger search if we have elements and results
    if (elements.length > 0 && results.length > 0) {
      setShouldExecuteSearch(true);
    }
  }, [elements.length, results.length]);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setCurrentPage(1);
  }, []);

  // Utility functions
  const getSearchQuery = useCallback(() => {
    const tags = elements
      .filter((el): el is { type: "tag"; value: Tag } => el.type === "tag")
      .map(el => el.value.name);
    
    const terms = elements
      .filter((el): el is { type: "text"; value: string } => el.type === "text")
      .map(el => el.value);

    return [...tags, ...terms].join(' ');
  }, [elements]);

  // URL management
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    
    const tags = elements
      .filter((el): el is { type: "tag"; value: Tag } => el.type === "tag")
      .map(el => el.value.name.toLowerCase());
    
    const terms = elements
      .filter((el): el is { type: "text"; value: string } => el.type === "text")
      .map(el => el.value.toLowerCase());

    if (tags.length) params.set("tags", tags.join(","));
    if (terms.length) params.set("terms", terms.join(","));
    if (currentPage > 1) params.set("page", currentPage.toString());
    
    // Add filters to URL
    if (filters.sortBy !== 'relevance') {
      params.set("sort", filters.sortBy);
    }
    
    const url = params.toString() ? `/search?${params.toString()}` : '/search';
    router.push(url);
  }, [elements, filters, currentPage, router]);

  // Search execution
  const executeSearch = useCallback(async () => {
    const query = getSearchQuery();
    if (!query.trim() && elements.length === 0) return;

    setIsLoading(true);
    setError(null);

    // Add to search history
    if (query.trim()) {
      setSearchHistory(prev => {
        const newHistory = [query, ...prev.filter(h => h !== query)].slice(0, 10);
        return newHistory;
      });
    }

    try {
      // Use the search service
      const searchResult = await searchProducts(elements, filters, currentPage, resultsPerPage);
      
      setResults(searchResult.results);
      setTotalResults(searchResult.totalResults);
      
      updateURL();
    } catch (error) {
      console.error('Search error:', error);
      setError(error instanceof Error ? error.message : 'Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [elements, filters, currentPage, resultsPerPage, getSearchQuery, updateURL]);

  // Keyboard handling
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " ") {
      // Check if current input matches a tag
      const match = allTags.find(
        (tag) =>
          tag.name.toLowerCase() === input.trim().toLowerCase() &&
          !elements.some((el) => el.type === "tag" && el.value.id === tag.id)
      );

      if (match) {
        // Convert to tag WITHOUT triggering search
        addElement({ type: "tag", value: match });
        e.preventDefault();
      }
      // If no tag match, allow space to work normally for multi-word input
    } else if (e.key === "Enter") {
      if (input.trim()) {
        // Check if the input matches a tag
        const match = allTags.find(
          (tag) =>
            tag.name.toLowerCase() === input.trim().toLowerCase() &&
            !elements.some((el) => el.type === "tag" && el.value.id === tag.id)
        );

        if (match) {
          addElementAndSearch({ type: "tag", value: match });
        } else {
          addElementAndSearch({ type: "text", value: input.trim() });
        }
      } else {
        // Execute search with existing elements
        executeSearch();
      }
    } else if (e.key === "Backspace" && input === "" && elements.length > 0) {
      const last = elements[elements.length - 1];
      removeElement(last.type, last.type === 'tag' ? last.value.id : undefined, last.type === 'text' ? last.value : undefined);
      if (last.type === "text") {
        setInput(last.value + " ");
      }
    }
  }, [input, elements, addElement, addElementAndSearch, removeElement, executeSearch]);

  // Tag handling
  const handleTagAdd = useCallback((tag: Tag) => {
    addElement({ type: "tag", value: tag });
  }, [addElement]);

  const handleTagRemove = useCallback((tagId: number) => {
    removeElement('tag', tagId);
  }, [removeElement]);

  // Auto-execute search ONLY when shouldExecuteSearch flag is set to true
  useEffect(() => {
    if (shouldExecuteSearch) {
      const timeoutId = setTimeout(() => {
        executeSearch();
        setShouldExecuteSearch(false);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [shouldExecuteSearch, executeSearch]);

  // Handle pagination changes
  const setCurrentPageAndSearch = useCallback((page: number) => {
    setCurrentPage(page);
    if (elements.length > 0 && results.length > 0) {
      setShouldExecuteSearch(true);
    }
  }, [elements.length, results.length]);

  // Reset search
  const resetSearch = useCallback(() => {
    setElements([]);
    setInput('');
    setFilters(initialFilters);
    setResults([]);
    setError(null);
    setCurrentPage(1);
    setSuggestions([]);
    router.push('/search');
  }, [router]);

  return {
    // State
    elements,
    input,
    filters,
    results,
    isLoading,
    error,
    suggestions,
    searchHistory,
    totalResults,
    currentPage,
    resultsPerPage,

    // Input management
    handleInputChange,
    setInput,

    // Element management
    addElement,
    removeElement,
    clearElements,

    // Filter management
    updateFilters,
    resetFilters,

    // Search execution
    executeSearch,

    // Suggestions
    updateSuggestions,

    // Pagination
    setCurrentPage: setCurrentPageAndSearch,

    // Utility
    getSearchQuery,
    resetSearch,
    updateURL,

    // Event handlers
    handleKeyDown,
    handleTagAdd,
    handleTagRemove,
  };
}
