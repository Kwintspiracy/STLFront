"use client";

import { Tag } from "@/data/mock-tags";
import { useRef } from "react";
import { FiSearch } from "react-icons/fi"; // Exemple d’icône plus élégante

type SearchElement = { type: "tag"; value: Tag } | { type: "text"; value: string };

interface Props {
    elements: SearchElement[];
    input: string;
    onInputChange: (text: string) => void;
    onTagAdd: (tag: Tag) => void;
    onTagRemove: (tagId: number) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    suggestions: Tag[];
    onSearch: () => void;
}

export default function SearchBar({
    elements,
    input,
    onInputChange,
    onTagAdd,
    onTagRemove,
    onKeyDown,
    suggestions,
    onSearch,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="relative w-full max-w-2xl flex items-center gap-2">
            {/* Search Field */}
            <div className="flex-1 bg-[#424A50] rounded px-3 flex flex-wrap items-center gap-2 h-14 overflow-hidden">
                {elements.map((el, index) =>
                    el.type === "tag" ? (
                        <div
                            key={`tag-${el.value.id}`}
                            className="bg-[#2D3235] text-white text-base px-3 py-1 rounded-full flex items-center gap-2"
                        >
                            {el.value.name}
                            <button
                                onClick={() => onTagRemove(el.value.id)}
                                className="text-gray-400 hover:text-red-400"
                            >
                                ×
                            </button>
                        </div>
                    ) : (
                        <span
                            key={`text-${index}`}
                            className="text-white text-sm bg-transparent px-1"
                        >
                            {el.value}
                        </span>
                    )
                )}

                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={onKeyDown}
                    className="bg-transparent text-white outline-none text-base grow min-w-[100px] h-full"
                    placeholder={
                        elements.length === 0 && input === "" ? "Search by tag or keyword..." : ""
                    }
                />
            </div>

            {/* Search Button */}
            <button
                onClick={onSearch}
                className="bg-gradient-to-br from-[#3538e0] to-primary text-secondary px-6 h-14 rounded text-base font-semibold hover:bg-[#a0f060] transition flex items-center justify-center cursor-pointer"
            >
                <span className="block sm:hidden"><FiSearch size={24} /></span>
                <span className="hidden sm:block">Search</span>
            </button>


            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
                <ul className="absolute left-0 top-full mt-1 w-full bg-[#1B1F22] border border-[#2A2A2A] rounded shadow text-sm text-white max-h-[180px] overflow-y-auto z-10">
                    {suggestions.map((tag) => (
                        <li
                            key={tag.id}
                            onClick={() => {
                                onTagAdd(tag);
                                inputRef.current?.focus();
                            }}
                            className="px-4 py-2 hover:bg-[#2D3235] cursor-pointer"
                        >
                            {tag.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
