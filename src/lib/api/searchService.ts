import { SEARCH_ENDPOINTS } from './config';
import { Product } from '@/types/product';
import { Tag } from '@/types/tag';

// Search element types
export type SearchElement = 
  | { type: "tag"; value: Tag } 
  | { type: "text"; value: string };

// Search filters interface
export interface SearchFilters {
  priceRange: {
    min: number;
    max: number;
  };
  categories: string[];
  ratings: number[];
  licenseTypes: ('personal' | 'commercial')[];
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'newest' | 'popular';
}

// Search result interface
export interface SearchResult {
  results: Product[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
}

// Main search function - API only
export async function searchProducts(
  elements: SearchElement[],
  filters: SearchFilters,
  page: number = 1,
  resultsPerPage: number = 20
): Promise<SearchResult> {
  try {
    // Prepare search parameters
    const searchParams = {
      tags: elements
        .filter((el): el is { type: "tag"; value: Tag } => el.type === "tag")
        .map(el => el.value.name),
      terms: elements
        .filter((el): el is { type: "text"; value: string } => el.type === "text")
        .map(el => el.value),
      filters: {
        price_min: filters.priceRange.min,
        price_max: filters.priceRange.max,
        categories: filters.categories,
        ratings: filters.ratings,
        license_types: filters.licenseTypes,
        sort_by: filters.sortBy
      },
      page,
      page_size: resultsPerPage
    };

    const response = await fetch(SEARCH_ENDPOINTS.PRODUCTS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchParams)
    });

    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      results: data.results || [],
      totalResults: data.total_results || 0,
      currentPage: data.current_page || page,
      totalPages: data.total_pages || 0
    };
  } catch (error) {
    console.error('Search API error:', error);
    throw new Error('Search failed. Please try again.');
  }
}

// Search suggestions function - API only
export async function getSearchSuggestions(query: string): Promise<Tag[]> {
  try {
    const response = await fetch(`${SEARCH_ENDPOINTS.SUGGESTIONS}?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`Suggestions API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Suggestions API error:', error);
    return [];
  }
}
