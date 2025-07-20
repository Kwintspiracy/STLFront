"use client";

import { Tag } from "@/data/mock-tags";
import { useRef, useEffect } from "react";
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

    // Auto-focus on mount for homepage
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div className="relative w-full max-w-3xl flex items-center gap-3">
            {/* Search Field */}
            <div className="flex-1 bg-background border border-border rounded-xl px-4 py-3 flex flex-wrap items-center gap-2 min-h-[56px] focus-within:border-primary transition-colors">
                {elements.map((el, index) =>
                    el.type === "tag" ? (
                        <div
                            key={`tag-${el.value.id}`}
                            className="bg-primary text-primary-foreground text-sm px-3 py-1.5 rounded-full flex items-center gap-2 font-medium"
                        >
                            {el.value.name}
                            <button
                                onClick={() => onTagRemove(el.value.id)}
                                className="text-primary-foreground/70 hover:text-error font-bold text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>
                    ) : (
                        <span
                            key={`text-${index}`}
                            className="text-text-primary text-base"
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
                    className="bg-transparent text-text-primary outline-none text-base grow min-w-[120px] placeholder-text-muted"
                    placeholder={
                        elements.length === 0 && input === "" ? "Search miniatures, creators, or tags..." : ""
                    }
                />
            </div>

            {/* Search Button */}
            <button
                onClick={onSearch}
                className="bg-background-card text-text-secondary px-4 py-3.5 rounded-xl text-base font-medium hover:bg-background-hover hover:text-text-primary transition-colors flex items-center justify-center min-w-[56px] border border-border"
            >
                <span className="block sm:hidden"><FiSearch size={18} /></span>
                <span className="hidden sm:block">Search</span>
            </button>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
                <ul className="absolute left-0 top-full mt-2 w-full bg-background-card border border-border rounded-xl shadow-xl text-sm text-text-primary max-h-[200px] overflow-y-auto z-50">
                    {suggestions.map((tag) => (
                        <li
                            key={tag.id}
                            onClick={() => {
                                onTagAdd(tag);
                                inputRef.current?.focus();
                            }}
                            className="px-4 py-3 hover:bg-background-hover cursor-pointer border-b border-border last:border-b-0 transition-colors"
                        >
                            <span className="font-medium">{tag.name}</span>
                            <span className="text-xs text-text-muted ml-2">Tag</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
