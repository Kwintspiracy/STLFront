"use client";

import SearchBar from "./SearchBar";
import { useSearch } from "@/hooks/useSearch";

export default function SearchWrapper() {
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

    return (
        <div className="relative w-full bg-background">
            {/* Modern gradient overlay */}
            <div className="absolute inset-0 b" />
            
            {/* Content */}
            <div className="relative z-20 max-w-7xl mx-auto flex flex-col px-4 sm:px-6 lg:px-6 py-6 sm:py-12 md:py-16 lg:py-16">
                {/* Hero Content */}
                {/* <div className="text-center mb-6 sm:mb-12">
                    <h1 className="text-2xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-0 xs:mb-6 sm:mb-6 lg:mb-6">
                        <span className="block xs:inline sm:inline">Find your perfect <span className="text-primary">Miniature</span></span>
                        
                    </h1>
                    <p className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                        Discover thousands of high-quality 3D models from talented creators worldwide. 
                        Perfect for tabletop gaming, painting, and collecting.
                    </p>
                </div> */}

                {/* Search Section */}
                <div className="w-full max-w-4xl mx-auto">
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
            </div>
        </div>
    );
}
