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
        <div className="relative w-full bg-gradient-to-br from-primarybackground via-cardbackground to-primarybackground">
            {/* Modern gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
            
            {/* Content */}
            <div className="relative z-20 max-w-7xl mx-auto flex flex-col items-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                {/* Hero Content */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                        Find your perfect
                        <span className="block text-primary mt-2">Miniature</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        Discover thousands of high-quality 3D models from talented creators worldwide. 
                        Perfect for tabletop gaming, painting, and collecting.
                    </p>
                </div>

                {/* Search Section */}
                <div className="w-full max-w-4xl">
                    <div className="bg-cardbackground/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 sm:p-8">
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
                                    <span className="text-sm text-gray-400 mr-2">Popular:</span>
                                    {["Fantasy", "Sci-Fi", "Medieval", "Dragons", "Heroes"].map((tag) => (
                                        <button
                                            key={tag}
                                            onClick={() => {
                                                const tagObj = allTags.find(t => t.name.toLowerCase() === tag.toLowerCase());
                                                if (tagObj && !elements.some(el => el.type === "tag" && el.value.id === tagObj.id)) {
                                                    handleTagAdd(tagObj);
                                                }
                                            }}
                                            className="px-3 py-1 bg-primarybackground border border-gray-700 rounded-full text-sm text-gray-300 hover:border-primary hover:text-primary transition-colors"
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
