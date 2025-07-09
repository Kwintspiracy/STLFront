'use client';

import { SearchFiltersSidebar, SearchResults, SearchResultsCount } from '@/components/search';

export default function SearchPage() {
  return (
    <div className="w-full min-h-screen bg-primarybackground">
      {/* Page Header - Full width */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Search Results</h1>
            <SearchResultsCount />
          </div>
        </div>
      </div>

      {/* Search Layout - Full width with centered content */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Sidebar with Filters - Fixed on left */}
            <div className="hidden lg:block lg:w-80 flex-shrink-0">
              <div className="sticky top-24">
                <SearchFiltersSidebar />
              </div>
            </div>

            {/* Main Content Area - Centered */}
            <div className="flex-1 min-w-0 flex justify-center">
              <div className="w-full max-w-6xl">
                {/* Mobile Filter Button - Shown only on mobile */}
                <div className="lg:hidden mb-6">
                  <SearchFiltersSidebar isMobile={true} />
                </div>
                
                <SearchResults />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
