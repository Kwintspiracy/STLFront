"use client";

import { useState } from "react";

const MainSearch = () => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) {
      console.log("Searching for:", query);
    }
  };

  return (
    //Block
    <div className="w-full bg-[#0F1213]">
      <div className="max-w-[1920px] mx-auto min-h-140 flex justify-center items-center px-4 sm:px-6 lg:px-8">
        <div className="w-full flex flex-col gap-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center text-white">
            Find your perfect Miniature
          </h1>
          <p className="text-4xl sm:text-5xl lg:text-2xl text-center text-white pb-3">
            Join a community and table-top players and 3D artists
          </p>

          <div className="w-full max-w-4xl mx-auto rounded-2xl">
            <div className="relative flex items-center ">
              <div className="absolute left-4 text-muted w-5 h-5">🔍</div>
              <input
                type="text"
                placeholder="Search for dragons, warriors, terrain, and more..."
                className="bg-[#1D2124] w-full pl-12 pr-32 py-5 rounded-lg text-lg sm:text-xl text-[#F4F4F4]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-700 px-6 py-3 rounded-md text-white text-base sm:text-xl"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default MainSearch;
