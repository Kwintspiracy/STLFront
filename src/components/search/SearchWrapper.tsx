"use client";

import SearchBar from "./SearchBar";
import { allTags } from "@/data/mock-tags";
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
            <div className="relative z-20 max-w-7xl mx-auto flex flex-col items-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
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
                <div className="w-full max-w-4xl">
                    <div className="bg-background-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8">
                        <div className="flex justify-center">
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
                        
                        {/* Quick Search Tags */}
                        <div className="mt-6 flex justify-center">
                            <div className="w-full max-w-3xl">
                                <div className="flex flex-wrap items-center gap-2 pl-0">
                                    <span className="text-sm text-text-muted mr-2">Popular:</span>
                                    {["Fantasy", "Sci-Fi", "Medieval", "Dragons", "Heroes"].map((tag) => (
                                        <button
                                            key={tag}
                                            onClick={() => {
                                                const tagObj = allTags.find(t => t.name.toLowerCase() === tag.toLowerCase());
                                                if (tagObj && !elements.some(el => el.type === "tag" && el.value.id === tagObj.id)) {
                                                    handleTagAdd(tagObj);
                                                }
                                            }}
                                            className="px-3 py-1 bg-background border border-border rounded-full text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
