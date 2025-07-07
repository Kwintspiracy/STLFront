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
  FaTimes,
  FaSearch,
  FaBell,
  FaHeart,
  FaHome,
  FaFire,
  FaCrown,
  FaBars,
  FaChevronRight
} from 'react-icons/fa';
import { useEffect, useState, useRef, useCallback } from 'react';
import SearchBar from '@/components/search/SearchBar';
import { allTags, Tag } from "@/data/mock-tags";

type SearchElement = { type: "tag"; value: Tag } | { type: "text"; value: string };

const Header = () => {
  const { user, setUser } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backdropVisible, setBackdropVisible] = useState(false);
  const [searchFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search state
  const [elements, setElements] = useState<SearchElement[]>([]);
  const [input, setInput] = useState("");

  const isHomePage = pathname === '/';

  const toggleDropdown = useCallback(() => {
    if (!dropdownOpen) {
      setDropdownOpen(true);
      setBackdropVisible(true);
    } else {
      setBackdropVisible(false);
      setDropdownOpen(false);
    }
  }, [dropdownOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const sidebarElement = document.querySelector('[data-sidebar="user-menu"]');
      
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        // Don't close if clicking inside the sidebar
        if (sidebarElement && sidebarElement.contains(target)) {
          return;
        }
        if (dropdownOpen) {
          toggleDropdown();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen, toggleDropdown]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dropdownOpen) {
        toggleDropdown();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [dropdownOpen, toggleDropdown]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (dropdownOpen || mobileMenuOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [dropdownOpen, mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setUser(null);
    setDropdownOpen(false);
    router.push('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

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

  // Navigation items
  const navigationItems = [
    { href: '/', label: 'Home', icon: FaHome, active: pathname === '/' },
    { href: '/trending', label: 'Trending', icon: FaFire, active: pathname === '/trending' },
    { href: '/featured', label: 'Featured', icon: FaCrown, active: pathname === '/featured' },
    { href: '/categories', label: 'Categories', icon: FaBars, active: pathname.startsWith('/category') },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-primarybackground/95 backdrop-blur-md border-b border-gray-700/50 shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Logo + Navigation */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link 
                href="/" 
                className="flex items-center gap-2 text-xl font-bold text-white hover:text-primary transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-sm">3D</span>
                </div>
                <span className="hidden sm:block">STLForge</span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      item.active 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center: Search Bar (non-homepage) */}
            {!isHomePage && (
              <div className="hidden md:flex flex-1 max-w-lg mx-8">
                <div className="w-full">
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
            )}

            {/* Right: Actions + User */}
            <div className="flex items-center gap-3">
              {/* Mobile Search Button */}
              {!isHomePage && (
                <button className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">
                  <FaSearch className="w-4 h-4" />
                </button>
              )}

              {/* Quick Actions */}
              {user && (
                <>
                  {/* Notifications */}
                  <button className="hidden sm:flex p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors relative">
                    <FaBell className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
                  </button>

                  {/* Favorites */}
                  <Link 
                    href="/favorites"
                    className="hidden sm:flex p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                  >
                    <FaHeart className="w-4 h-4" />
                  </Link>
                </>
              )}

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors group"
                aria-label="Shopping cart"
              >
                <FaShoppingCart className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black rounded-full text-xs font-bold flex items-center justify-center">
                  3
                </span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                <FaBars className="w-4 h-4" />
              </button>

              {/* User Profile */}
              {!mounted ? (
                <div className="w-8 h-8 bg-gray-800 rounded-full animate-pulse" />
              ) : user ? (
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={toggleDropdown} 
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-800/50 transition-colors group"
                    aria-label="User menu"
                    aria-expanded={dropdownOpen}
                  >
                    {user.profilePicture ? (
                      <Image
                        src={user.profilePicture}
                        alt={`${user.username}'s profile`}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full border-2 border-gray-600 group-hover:border-primary/50 transition-colors"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-gray-600 group-hover:border-primary/50 transition-colors bg-gray-700 flex items-center justify-center">
                        <FaUserCircle className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <span className="hidden xl:block text-sm text-gray-300 group-hover:text-white transition-colors">
                      {user.username}
                    </span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-[#3f6061] hover:text-secondary transition-colors text-sm"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar (when not on homepage) */}
        {!isHomePage && searchFocused && (
          <div className="md:hidden border-t border-gray-700/50 p-4">
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
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="fixed inset-0 bg-primarybackground/50 transition-opacity duration-300"
            onClick={toggleMobileMenu}
          />
          <div className="fixed left-0 top-0 h-screen w-80 max-w-[85vw] bg-primarybackground border-r border-gray-700/50 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-sm">3D</span>
                </div>
                <span className="text-white font-bold">STLForge</span>
              </div>
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-gray-400 hover:text-white rounded-lg"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            
            <nav className="p-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={toggleMobileMenu}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors mb-1 ${
                    item.active 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  <FaChevronRight className="w-3 h-3 ml-auto" />
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* User Sidebar Menu */}
      {dropdownOpen && user && (
        <div className="fixed inset-0 z-50">
          <div 
            className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${
              backdropVisible ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={toggleDropdown}
          />
          
          <div className="fixed right-0 top-0 h-screen w-80 max-w-[85vw] bg-primarybackground border-l border-gray-700/50 shadow-2xl transform transition-transform duration-300 ease-out" data-sidebar="user-menu">
            
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 h-16 border-b border-gray-700/50">
              <div className="flex items-center space-x-3">
                {user.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full border border-primary/50"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full border border-primary/50 bg-gray-700 flex items-center justify-center">
                    <FaUserCircle className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white">{user.username}</p>
                  <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                </div>
              </div>
              <button
                onClick={toggleDropdown}
                className="fixed top-4 right-4 lg:right-6 p-1 rounded-lg hover:bg-gray-800/50 transition-colors z-[60]"
                aria-label="Close menu"
              >
                <FaTimes className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex flex-col h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="py-4">
                {/* Account Section */}
                <div className="px-4 py-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">
                    Account
                  </p>
                  
                  <Link
                    href="/profile"
                    className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-lg mx-1 transition-colors group"
                  >
                    <FaUser className="w-4 h-4 mr-3 text-primary group-hover:scale-110 transition-transform" />
                    My Profile
                  </Link>

                  <Link
                    href="/settings"
                    className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-lg mx-1 transition-colors group"
                  >
                    <FaCog className="w-4 h-4 mr-3 text-primary group-hover:scale-110 transition-transform" />
                    Settings
                  </Link>
                </div>

                {/* Studio Section */}
                {hasStudio && isStudioMember && (
                  <div className="px-4 py-2 border-t border-gray-700/50 mt-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">
                      Studio
                    </p>
                    
                    <Link
                      href={`/studio/${user.studio?.id}`}
                      className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-lg mx-1 transition-colors group"
                    >
                      <FaStore className="w-4 h-4 mr-3 text-primary group-hover:scale-110 transition-transform" />
                      {user.studio?.name}
                    </Link>

                    <Link
                      href={`/studio/${user.studio?.id}/products`}
                      className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-lg mx-1 transition-colors group"
                    >
                      <FaStore className="w-4 h-4 mr-3 text-gray-400 group-hover:scale-110 transition-transform" />
                      Manage Products
                    </Link>

                    <Link
                      href={`/studio/${user.studio?.id}/add-product`}
                      className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-lg mx-1 transition-colors group"
                    >
                      <FaPlus className="w-4 h-4 mr-3 text-gray-400 group-hover:scale-110 transition-transform" />
                      Add Product
                    </Link>

                    {isStudioAdmin && (
                      <Link
                        href={`/studio/${user.studio?.id}/settings`}
                        className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-lg mx-1 transition-colors group"
                      >
                        <FaCog className="w-4 h-4 mr-3 text-gray-400 group-hover:scale-110 transition-transform" />
                        Studio Settings
                      </Link>
                    )}

                    <Link
                      href={`/studio/${user.studio?.id}/earnings`}
                      className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-lg mx-1 transition-colors group"
                    >
                      <FaDollarSign className="w-4 h-4 mr-3 text-gray-400 group-hover:scale-110 transition-transform" />
                      Earnings
                    </Link>

                    <Link
                      href={`/studio/${user.studio?.id}/payout`}
                      className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-lg mx-1 transition-colors group"
                    >
                      <FaCreditCard className="w-4 h-4 mr-3 text-gray-400 group-hover:scale-110 transition-transform" />
                      Payout
                    </Link>
                  </div>
                )}

                {/* Logout */}
                <div className="px-4 py-2 border-t border-gray-700/50 mt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg mx-1 transition-colors group"
                  >
                    <FaSignOutAlt className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
