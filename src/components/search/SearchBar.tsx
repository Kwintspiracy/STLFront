"use client";

import { Tag } from "@/data/mock-tags";
import { useRef, useEffect, useState } from "react";

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
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile device and handle auto-focus
    useEffect(() => {
        const checkMobile = () => {
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 640;
            setIsMobile(isMobileDevice);
            
            // Only auto-focus on desktop to prevent unwanted keyboard popup on mobile
            if (inputRef.current && !isMobileDevice) {
                inputRef.current.focus();
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="relative w-full">
            {/* Search Field */}
            <div className={`w-full bg-[#1B2731] rounded-[50px] flex items-center gap-2 sm:gap-3 ${
                compact 
                    ? 'py-1 px-4 sm:px-5 pr-1' 
                    : 'py-2 sm:py-2 px-4 sm:pr-3 sm:pl-8 md:pr-3 pr-2'
            }`}>
                {elements.map((el, index) =>
                    el.type === "tag" ? (
                        <div
                            key={`tag-${el.value.id}`}
                            className="bg-primary text-primary-foreground text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-2 font-medium shrink-0"
                        >
                            {el.value.name}
                            <button
                                onClick={() => onTagRemove(el.value.id)}
                                className="text-primary-foreground/70 hover:text-error font-bold text-sm sm:text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>
                    ) : (
                        <span
                            key={`text-${index}`}
                            className="text-white text-base sm:text-lg md:text-xl font-normal"
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
                    className="bg-transparent outline-none text-base sm:text-lg font-normal grow min-w-[80px] sm:min-w-[120px]"
                    style={{ 
                        color: elements.length === 0 && input === "" ? 'rgba(255, 255, 255, 0.35)' : 'white'
                    }}
                    placeholder={
                        elements.length === 0 && input === "" 
                            ? (isMobile ? "Search..." : "Search for characters, monsters...") 
                            : ""
                    }
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck="false"
                />

                {/* Integrated Search Button */}
                <button
                    onClick={onSearch}
                    className={`bg-[#324FEE] text-white rounded-full flex items-center justify-center hover:bg-[#2940d9] transition-colors shrink-0 ${
                        compact 
                            ? 'px-4 sm:px-5 py-2 sm:py-3' 
                            : 'px-6 sm:px-6 md:px-8 py-3 sm:py-3 md:py-3'
                    }`}
                >
                    {isMobile ? (
                        <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className="text-white"
                        >
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                        </svg>
                    ) : (
                        <span className={`${
                            compact 
                                ? 'text-sm sm:text-base md:text-lg' 
                                : 'text-sm sm:text-base md:text-lg'
                        } font-normal leading-6 whitespace-nowrap`}>
                            Search
                        </span>
                    )}
                </button>
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
                <ul className="absolute left-0 top-full mt-2 w-full bg-background-card border border-border rounded-xl shadow-xl text-sm sm:text-base text-text-primary max-h-[200px] sm:max-h-[250px] overflow-y-auto z-50">
                    {suggestions.map((tag) => (
                        <li
                            key={tag.id}
                            onClick={() => {
                                onTagAdd(tag);
                                if (!isMobile && inputRef.current) {
                                    inputRef.current.focus();
                                }
                            }}
                            className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-background-hover active:bg-background-hover cursor-pointer border-b border-border last:border-b-0 transition-colors min-h-[48px] flex items-center"
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
