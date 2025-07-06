'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { logout } from '@/lib/utils/sessionService';
import { 
  FaUserCircle, 
  FaShoppingCart, 
  FaUser,
  FaSignOutAlt,
  FaStore,
  FaCog,
  FaPlus,
  FaDollarSign,
  FaCreditCard,
  FaChevronDown,
  FaTimes
} from 'react-icons/fa';
import { useEffect, useState, useRef } from 'react';
import SearchBar from '@/components/search/SearchBar';
import { allTags, Tag } from "@/data/mock-tags";

type SearchElement = { type: "tag"; value: Tag } | { type: "text"; value: string };

const Header = () => {
  const { user, setUser } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search state
  const [elements, setElements] = useState<SearchElement[]>([]);
  const [input, setInput] = useState("");

  const isHomePage = pathname === '/';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when sidebar is open and compensate for scrollbar width
  useEffect(() => {
    if (dropdownOpen) {
      // Calculate scrollbar width to prevent content shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Apply overflow hidden and compensate for scrollbar width
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      // Reset styles
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    logout();
    setUser(null);
    setDropdownOpen(false);
    router.push('/');
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // Search handlers
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

  // Check if user has studio and their role
  const hasStudio = user?.studio;
  const isStudioAdmin = user?.role === 'admin';
  const isStudioMember = user?.role === 'member' || user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full bg-primarybackground border-b border-gray-700/50 shadow-lg">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        
        {/* Left: Website Title */}
        <div className="flex-shrink-0">
          <Link 
            href="/" 
            className="text-lg lg:text-xl font-black text-white hover:text-primary transition-colors duration-200"
          >
            3D STLForge
          </Link>
        </div>

        {/* Center: Search Bar (conditional) */}
        {!isHomePage && (
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
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
        )}

        {/* Right: Cart + User Profile */}
        <div className="flex items-center gap-3">
          {/* Cart Button */}
          <Link
            href="/cart"
            className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200 group"
            aria-label="Shopping cart"
          >
            <FaShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          </Link>

          {/* User Profile Menu */}
          {!mounted ? (
            <div className="w-10 h-10 bg-gray-800 rounded-full animate-pulse" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={toggleDropdown} 
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-800/50 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label="User menu"
                aria-expanded={dropdownOpen}
              >
                <Image
                  src={user.profilePicture || 'https://via.placeholder.com/40'}
                  alt={`${user.username}'s profile`}
                  width={40}
                  height={40}
                  className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-gray-600 group-hover:border-primary/50 transition-colors duration-200"
                />
                <FaChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Sidebar Menu */}
              {dropdownOpen && (
                <div className="fixed inset-0 z-50">
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 bg-primarybackground/50 transition-opacity duration-300"
                    onClick={() => setDropdownOpen(false)}
                  />
                  
                  {/* Sidebar */}
                  <div className="fixed right-0 top-0 h-screen w-80 max-w-[85vw] bg-primarybackground border-l border-gray-700/50 shadow-2xl transform transition-transform duration-300 ease-out">
                    
                    {/* Sidebar Header with User Info and Close Button */}
                    <div className="flex items-center justify-between p-4 h-16 border-b border-gray-700/50">
                      <div className="flex items-center space-x-3">
                        <Image
                          src={user.profilePicture || 'https://via.placeholder.com/40'}
                          alt="Profile"
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full border border-primary/50"
                        />
                        <div>
                          <p className="font-semibold text-white">{user.username}</p>
                          <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setDropdownOpen(false)}
                        className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        aria-label="Close menu"
                      >
                        <FaTimes className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>

                    {/* Sidebar Content - No scrolling */}
                    <div className="flex flex-col h-[calc(100vh-4rem)]">
                      <div className="py-4">
                        {/* Account Section */}
                        <div className="px-4 py-2">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">
                            Account
                          </p>
                          
                          <Link
                            href="/profile"
                            className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-lg mx-1 transition-colors duration-200 group"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <FaUser className="w-4 h-4 mr-3 text-primary group-hover:scale-110 transition-transform duration-200" />
                            My Profile
                          </Link>

                          <Link
                            href="/settings"
                            className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-lg mx-1 transition-colors duration-200 group"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <FaCog className="w-4 h-4 mr-3 text-primary group-hover:scale-110 transition-transform duration-200" />
                            Settings
                          </Link>
                        </div>

                        {/* Studio Section (only if user has studio) */}
                        {hasStudio && isStudioMember && (
                          <div className="px-4 py-2 border-t border-gray-700/50 mt-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">
                              Studio
                            </p>
                            
                            <Link
                              href={`/studio/${user.studio?.id}`}
                              className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-lg mx-1 transition-colors duration-200 group"
                              onClick={() => setDropdownOpen(false)}
                            >
                              <FaStore className="w-4 h-4 mr-3 text-primary group-hover:scale-110 transition-transform duration-200" />
                              {user.studio?.name}
                            </Link>

                            <Link
                              href={`/studio/${user.studio?.id}/products`}
                              className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-lg mx-1 transition-colors duration-200 group"
                              onClick={() => setDropdownOpen(false)}
                            >
                              <FaStore className="w-4 h-4 mr-3 text-gray-400 group-hover:scale-110 transition-transform duration-200" />
                              Manage Products
                            </Link>

                            <Link
                              href={`/studio/${user.studio?.id}/add-product`}
                              className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-lg mx-1 transition-colors duration-200 group"
                              onClick={() => setDropdownOpen(false)}
                            >
                              <FaPlus className="w-4 h-4 mr-3 text-gray-400 group-hover:scale-110 transition-transform duration-200" />
                              Add Product
                            </Link>

                            {isStudioAdmin && (
                              <Link
                                href={`/studio/${user.studio?.id}/settings`}
                                className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-lg mx-1 transition-colors duration-200 group"
                                onClick={() => setDropdownOpen(false)}
                              >
                                <FaCog className="w-4 h-4 mr-3 text-gray-400 group-hover:scale-110 transition-transform duration-200" />
                                Studio Settings
                              </Link>
                            )}

                            <Link
                              href={`/studio/${user.studio?.id}/earnings`}
                              className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-lg mx-1 transition-colors duration-200 group"
                              onClick={() => setDropdownOpen(false)}
                            >
                              <FaDollarSign className="w-4 h-4 mr-3 text-gray-400 group-hover:scale-110 transition-transform duration-200" />
                              Earnings
                            </Link>

                            <Link
                              href={`/studio/${user.studio?.id}/payout`}
                              className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-lg mx-1 transition-colors duration-200 group"
                              onClick={() => setDropdownOpen(false)}
                            >
                              <FaCreditCard className="w-4 h-4 mr-3 text-gray-400 group-hover:scale-110 transition-transform duration-200" />
                              Payout
                            </Link>
                          </div>
                        )}

                        {/* Logout */}
                        <div className="px-4 py-2 border-t border-gray-700/50 mt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg mx-1 transition-colors duration-200 group"
                          >
                            <FaSignOutAlt className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                            Logout
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200 group"
              aria-label="Sign in"
            >
              <FaUserCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
