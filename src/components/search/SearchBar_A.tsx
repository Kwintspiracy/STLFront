"use client";

import { Tag } from "@/data/mock-tags";
import { useRef, useEffect, useState } from "react";

interface Props {
  selectedTags: Tag[];
  input: string;
  onInputChange: (text: string) => void;
  onTagAdd: (tag: Tag) => void;
  onTagRemove: (tagId: number) => void;
  suggestions: Tag[];
}

export default function SearchBar({
  selectedTags,
  input,
  onInputChange,
  onTagAdd,
  onTagRemove,
  suggestions,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative w-full max-w-2xl">
      <div className="bg-[#1B1F22] border border-[#2A2A2A] rounded px-4 py-2 flex flex-wrap items-center gap-2">
        {selectedTags.map((tag) => (
          <div
            key={tag.id}
            className="bg-[#2D3235] text-white text-sm px-3 py-1 rounded-full flex items-center gap-2"
          >
            {tag.name}
            <button
              onClick={() => onTagRemove(tag.id)}
              className="text-gray-400 hover:text-red-400"
            >
              ×
            </button>
          </div>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          className="bg-transparent text-white flex-grow outline-none text-sm min-w-[120px]"
          placeholder="Search by tag or keyword..."
        />
      </div>

      {suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-[#1B1F22] border border-[#2A2A2A] rounded shadow text-sm text-white max-h-[180px] overflow-y-auto">
          {suggestions.map((tag) => (
  <li
    key={tag.id}
    onClick={() => {
      onTagAdd(tag);
      // 🔧 Rétablit le focus après sélection
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
