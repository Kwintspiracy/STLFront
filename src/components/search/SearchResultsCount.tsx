'use client';

import { useSearch } from '@/hooks/useSearch';

interface SearchResultsCountProps {
  className?: string;
}

export default function SearchResultsCount({ className = "" }: SearchResultsCountProps) {
  const {
    results,
    isLoading,
    error,
    totalResults,
    currentPage,
    resultsPerPage,
    getSearchQuery
  } = useSearch();

  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);
  const searchQuery = getSearchQuery();

  // Don't show anything if loading, error, or no search
  if (isLoading || error || (!searchQuery.trim() && results.length === 0)) {
    return null;
  }

  // Don't show if no results
  if (results.length === 0) {
    return null;
  }

  return (
    <p className={`text-gray-400 text-sm ${className}`}>
      {totalResults > 0 ? (
        <>
          Showing {startResult}-{endResult} of {totalResults} results for "{searchQuery}"
        </>
      ) : (
        `No results for "${searchQuery}"`
      )}
    </p>
  );
}
