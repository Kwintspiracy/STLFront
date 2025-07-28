"use client";

import { Tag } from "@/data/mock-tags";
import { useRef, useEffect } from "react";

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
    compact?: boolean;
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
    compact = false,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus on mount for homepage
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div className="relative w-full max-w-4xl">
            {/* Search Field */}
            <div 
                className="w-full bg-[#1B2731] rounded-[50px] flex items-center gap-3"
                style={{ 
                    paddingTop: compact ? '4px' : '6px',
                    paddingBottom: compact ? '4px' : '6px',
                    paddingLeft: compact ? '20px' : '49px',
                    paddingRight: '6px'
                }}
            >
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
                            className="text-white text-xl font-normal"
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
                    className="bg-transparent outline-none text-xl font-normal grow min-w-[120px]"
                    style={{ 
                        color: elements.length === 0 && input === "" ? 'rgba(255, 255, 255, 0.35)' : 'white'
                    }}
                    placeholder={
                        elements.length === 0 && input === "" ? "Search for characters, monsters..." : ""
                    }
                />

                {/* Integrated Search Button */}
                <button
                    onClick={onSearch}
                    className="bg-[#324FEE] text-white rounded-[50px] flex items-center justify-center hover:bg-[#2940d9] transition-colors"
                    style={{
                        paddingLeft: compact ? '20px' : '32px',
                        paddingRight: compact ? '20px' : '32px',
                        paddingTop: compact ? '12px' : '18px',
                        paddingBottom: compact ? '12px' : '18px'
                    }}
                >
                    <span className={`${compact ? 'text-lg' : 'text-xl'} font-normal leading-6`}>Search</span>
                </button>
            </div>

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
