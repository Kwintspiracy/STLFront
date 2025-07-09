import { USE_MOCK_DATA, SEARCH_ENDPOINTS } from './config';
import { mockProducts } from '@/data/mock-products';
import { Product, convertLegacyToProduct } from '@/types/product';
import { Tag } from '@/data/mock-tags';

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

// Main search function that switches between mock and real API
export async function searchProducts(
  elements: SearchElement[],
  filters: SearchFilters,
  page: number = 1,
  resultsPerPage: number = 20
): Promise<SearchResult> {
  if (USE_MOCK_DATA) {
    return searchMockProducts(elements, filters, page, resultsPerPage);
  } else {
    return searchRealAPI(elements, filters, page, resultsPerPage);
  }
}

// Mock search implementation
function searchMockProducts(
  elements: SearchElement[],
  filters: SearchFilters,
  page: number,
  resultsPerPage: number
): Promise<SearchResult> {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      let filteredProducts = [...mockProducts];

      // Filter by search elements (tags and text)
      if (elements.length > 0) {
        filteredProducts = filteredProducts.filter(product => {
          // Get product tags as lowercase strings
          const productTags = product.tag.map(t => t.name.toLowerCase());
          
          // Get search tags
          const searchTags = elements
            .filter((el): el is { type: "tag"; value: Tag } => el.type === "tag")
            .map(el => el.value.name.toLowerCase());
          
          // Get search text terms
          const searchTerms = elements
            .filter((el): el is { type: "text"; value: string } => el.type === "text")
            .map(el => el.value.toLowerCase());
          
          // Check if product has all required tags
          const hasAllTags = searchTags.length === 0 || searchTags.every(tag => productTags.includes(tag));
          
          // Check if product matches all text terms
          const hasAllTerms = searchTerms.length === 0 || searchTerms.every(term => 
            product.name.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term) ||
            productTags.some(tag => tag.includes(term)) ||
            product.creator.name.toLowerCase().includes(term)
          );
          
          return hasAllTags && hasAllTerms;
        });
      }

      // Apply price filter
      if (filters.priceRange.min > 0 || filters.priceRange.max < 1000) {
        filteredProducts = filteredProducts.filter(product => {
          const price = parseFloat(product.price);
          return price >= filters.priceRange.min && price <= filters.priceRange.max;
        });
      }

      // Apply category filter
      if (filters.categories.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
          product.category.some(cat => 
            filters.categories.includes(cat.name)
          )
        );
      }

      // Apply license type filter (mock implementation)
      if (filters.licenseTypes.length > 0) {
        // For mock data, we'll assume all products support both license types
        // In real implementation, this would filter based on actual license data
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'price-low':
          filteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          break;
        case 'price-high':
          filteredProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
          break;
        case 'newest':
          filteredProducts.sort((a, b) => 
            new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
          );
          break;
        case 'popular':
          // For mock data, we'll sort by name as a placeholder
          filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'relevance':
        default:
          // Keep original order for relevance
          break;
      }

      // Calculate pagination
      const totalResults = filteredProducts.length;
      const totalPages = Math.ceil(totalResults / resultsPerPage);
      const startIndex = (page - 1) * resultsPerPage;
      const endIndex = startIndex + resultsPerPage;
      const paginatedResults = filteredProducts.slice(startIndex, endIndex);

      // Convert legacy products to new format
      const convertedResults = paginatedResults.map(product => convertLegacyToProduct(product as any));
      
      resolve({
        results: convertedResults,
        totalResults,
        currentPage: page,
        totalPages
      });
    }, 300); // Simulate network delay
  });
}

// Real API search implementation
async function searchRealAPI(
  elements: SearchElement[],
  filters: SearchFilters,
  page: number,
  resultsPerPage: number
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

// Search suggestions function
export async function getSearchSuggestions(query: string): Promise<Tag[]> {
  if (USE_MOCK_DATA) {
    // Mock implementation - filter existing tags
    const { allTags } = await import('@/data/mock-tags');
    return allTags.filter(tag =>
      tag.name.toLowerCase().startsWith(query.toLowerCase())
    ).slice(0, 5);
  } else {
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
}
