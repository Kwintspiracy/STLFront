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
            .filter((el) => el.type === "tag")
            .map((el) => (el as any).value.name.toLowerCase());

        const searchTerms = elements
            .filter((el) => el.type === "text")
            .map((el) => el.value.toLowerCase());

        if (selectedTags.length === 0 && searchTerms.length === 0) return;

        const params = new URLSearchParams();
        if (selectedTags.length) params.set("tags", selectedTags.join(","));
        if (searchTerms.length) params.set("terms", searchTerms.join(","));

        router.push(`/search?${params.toString()}`);
    };


    const selectedTags = elements.filter((el) => el.type === "tag").map((el) => (el as any).value);

    const suggestions =
        input.trim() === ""
            ? []
            : allTags.filter(
                (tag) =>
                    tag.name.toLowerCase().startsWith(input.toLowerCase()) &&
                    !selectedTags.some((t) => t.id === tag.id)
            );

    return (
        <div className="relative w-full pt-5 sm:pt-10 lg:pt-10 pb-10 sm:pb-20 lg:pb-10">
            {/* Image de fond */}
           
            {/* Overlay de couleur */}
            <div className="absolute inset-0 bg-secondarybackground opacity-[0.85] z-10" />

            {/* Contenu */}
            <div className="relative z-20 max-w-[1440px] mx-auto flex flex-col items-center px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-center text-white pb-3 sm:pb-4">
                    Find your perfect Miniature
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-center text-gray-300 pb-8 sm:pb-10 max-w-2xl">
                    Join a community of tabletop players and 3D artists
                </p>

                <div className="w-full">
                    <div className="w-full flex justify-center">
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
                </div>
            </div>
        </div>

    );
}
