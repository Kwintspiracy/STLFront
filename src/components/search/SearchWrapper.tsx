"use client";

import SearchBar from "./SearchBar";
import { allTags, Tag } from "@/data/mock-tags";
import { useState } from "react";
import { useRouter } from "next/navigation";


type SearchElement = { type: "tag"; value: Tag } | { type: "text"; value: string };

export default function SearchWrapper() {
    const [elements, setElements] = useState<SearchElement[]>([]);
    const [input, setInput] = useState("");

    const router = useRouter();

    const handleInputChange = (text: string) => {
        setInput(text);
    };

    const handleTagAdd = (tag: Tag) => {
        setElements((prev) => [...prev, { type: "tag", value: tag }]);
        setInput("");
    };

    const handleTagRemove = (tagId: number) => {
        setElements((prev) => prev.filter((el) => el.type !== "tag" || el.value.id !== tagId));
    };

    const handleTextAdd = (text: string) => {
        setElements((prev) => [...prev, { type: "text", value: text }]);
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === " ") {
            const words = input.trim().split(/\s+/);
            words.forEach((word) => {
                const match = allTags.find(
                    (tag) =>
                        tag.name.toLowerCase() === word.toLowerCase() &&
                        !elements.some((el) => el.type === "tag" && el.value.id === tag.id)
                );

                if (match) {
                    handleTagAdd(match);
                } else {
                    handleTextAdd(word);
                }
            });
            e.preventDefault();
        } else if (e.key === "Enter") {
            handleSearch();
        } else if (e.key === "Backspace" && input === "" && elements.length > 0) {
            const last = elements[elements.length - 1];
            setElements((prev) => prev.slice(0, -1));
            if (last.type === "text") {
                setInput(last.value + " ");
            }
        }
    };

    const handleSearch = () => {
        const selectedTags = elements
            .filter((el): el is { type: "tag"; value: Tag } => el.type === "tag")
            .map((el) => el.value.name.toLowerCase());

        const searchTerms = elements
            .filter((el): el is { type: "text"; value: string } => el.type === "text")
            .map((el) => el.value.toLowerCase());

        if (selectedTags.length === 0 && searchTerms.length === 0) return;

        const params = new URLSearchParams();
        if (selectedTags.length) params.set("tags", selectedTags.join(","));
        if (searchTerms.length) params.set("terms", searchTerms.join(","));

        router.push(`/search?${params.toString()}`);
    };


    const selectedTags = elements
        .filter((el): el is { type: "tag"; value: Tag } => el.type === "tag")
        .map((el) => el.value);

    const suggestions =
        input.trim() === ""
            ? []
            : allTags.filter(
                (tag) =>
                    tag.name.toLowerCase().startsWith(input.toLowerCase()) &&
                    !selectedTags.some((t) => t.id === tag.id)
            );

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
                                onSearch={handleSearch}
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
