'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaUserCircle, 
  FaUser,
  FaSignOutAlt,
  FaStore,
  FaCog,
  FaPlus,
  FaDollarSign,
  FaCreditCard,
  FaTimes,
  FaBoxes,
  FaHeart
} from 'react-icons/fa';

interface User {
  pk: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profilePicture?: string;
  role?: string;
}

interface Studio {
  studio: {
    id: number;
    name: string;
    color?: string;
  };
  membership: {
    role: 'owner' | 'admin' | 'member';
  };
}

interface UserMenuProps {
  user: User | null;
  isAuthenticated: boolean;
  myStudio: Studio | null;
  onLogout: () => void;
  className?: string;
}

export default function UserMenu({ 
  user, 
  isAuthenticated, 
  myStudio, 
  onLogout,
  className = "" 
}: UserMenuProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [backdropVisible, setBackdropVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasStudio = myStudio !== null;
  const isStudioAdmin = myStudio?.membership.role === 'admin' || myStudio?.membership.role === 'owner';
  const isStudioMember = myStudio?.membership.role === 'member' || myStudio?.membership.role === 'admin' || myStudio?.membership.role === 'owner';

  const toggleDropdown = useCallback(() => {
    if (!dropdownOpen) {
      setDropdownOpen(true);
      setBackdropVisible(true);
    } else {
      setBackdropVisible(false);
      setDropdownOpen(false);
    }
  }, [dropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const sidebarElement = document.querySelector('[data-sidebar="user-menu"]');
      
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
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
    if (dropdownOpen) {
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
  }, [dropdownOpen]);

  const handleLogout = () => {
    onLogout();
    setDropdownOpen(false);
  };

  if (!isAuthenticated || !user) {
    return (
      <Link
        href="/auth/signin"
        className={`hidden lg:flex px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-[#3f6061] hover:text-secondary transition-colors text-sm ${className}`}
      >
        Sign In
      </Link>
    );
  }

  return (
    <>
      <div className={`hidden lg:block relative ${className}`} ref={dropdownRef}>
        <button 
          onClick={toggleDropdown} 
          className="flex items-center gap-2 p-1 rounded-lg hover:bg-[var(--color-primary-studio-hover)]/5 transition-colors group"
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

      {/* User Sidebar Menu */}
      {dropdownOpen && (
        <div className="fixed inset-0 z-[9999]">
          <div 
            className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-[9998] ${
              backdropVisible ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={toggleDropdown}
          />
          
          <div className="fixed right-0 w-80 max-w-[85vw] bg-primarybackground border-l border-gray-700/50 shadow-2xl z-[9999]" 
               style={{ 
                 top: 'var(--header-height)', 
                 height: 'calc(100vh - var(--header-height))'
               }}
               data-sidebar="user-menu">
            
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 h-16 border-b border-gray-700/50 bg-primarybackground">
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
                  <p className="text-xs text-gray-400 capitalize">{user.role || 'user'}</p>
                </div>
              </div>
              <button
                onClick={toggleDropdown}
                className="p-1 rounded-lg hover:bg-[var(--color-primary-studio-hover)]/5 transition-colors"
                aria-label="Close menu"
              >
                <FaTimes className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="py-4">
                {/* Account Section */}
                <div className="px-4 py-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">
                    Account
                  </p>
                  
                  <Link
                    href="/profile"
                    className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-[var(--color-primary-studio-hover)]/5 hover:text-white rounded-lg mx-1 transition-colors group"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FaUser className="w-4 h-4 mr-3 text-primary group-hover:scale-110 transition-transform" />
                    My Profile
                  </Link>

                  <Link
                    href="/wishlist"
                    className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-[var(--color-primary-studio-hover)]/5 hover:text-white rounded-lg mx-1 transition-colors group"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FaHeart className="w-4 h-4 mr-3 text-primary group-hover:scale-110 transition-transform" />
                    Wishlist
                  </Link>

                  <Link
                    href="/settings"
                    className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-[var(--color-primary-studio-hover)]/5 hover:text-white rounded-lg mx-1 transition-colors group"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FaCog className="w-4 h-4 mr-3 text-primary group-hover:scale-110 transition-transform" />
                    Settings
                  </Link>
                </div>

                {/* Studio Section */}
                <div className="px-4 py-2 border-t border-gray-700/50 mt-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">
                    Studio
                  </p>
                  
                  {hasStudio && isStudioMember ? (
                    <>
                      <Link
                        href={`/studio/${myStudio?.studio.id}`}
                        className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-[var(--color-primary-studio-hover)]/5 hover:text-white rounded-lg mx-1 transition-colors group"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FaStore 
                          className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" 
                          style={{ color: myStudio?.studio.color || '#FDD811'
                            
                           }}
                        />
                        {myStudio?.studio.name}
                      </Link>

                      <Link
                        href={`/studio/${myStudio?.studio.id}/products`}
                        className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-[var(--color-primary-studio-hover)]/5 hover:text-white rounded-lg mx-1 transition-colors group"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FaBoxes className="w-4 h-4 mr-3 text-gray-400 group-hover:scale-110 transition-transform" />
                        Manage Products
                      </Link>

                      <Link
                        href={`/studio/${myStudio?.studio.id}/products/add`}
                        className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-[var(--color-primary-studio-hover)]/5 hover:text-white rounded-lg mx-1 transition-colors group"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FaPlus className="w-4 h-4 mr-3 text-gray-400 group-hover:scale-110 transition-transform" />
                        Add Product
                      </Link>

                      {isStudioAdmin && (
                        <Link
                          href={`/studio/${myStudio?.studio.id}/settings`}
                          className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-[var(--color-primary-studio-hover)]/5 hover:text-white rounded-lg mx-1 transition-colors group"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FaCog className="w-4 h-4 mr-3 text-gray-400 group-hover:scale-110 transition-transform" />
                          Studio Settings
                        </Link>
                      )}

                      <Link
                        href={`/studio/${myStudio?.studio.id}/earnings`}
                        className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-[var(--color-primary-studio-hover)]/5 hover:text-white rounded-lg mx-1 transition-colors group"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FaDollarSign className="w-4 h-4 mr-3 text-gray-400 group-hover:scale-110 transition-transform" />
                        Earnings
                      </Link>

                      <Link
                        href={`/studio/${myStudio?.studio.id}/payout`}
                        className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-[var(--color-primary-studio-hover)]/5 hover:text-white rounded-lg mx-1 transition-colors group"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FaCreditCard className="w-4 h-4 mr-3 text-gray-400 group-hover:scale-110 transition-transform" />
                        Payout
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/studio/create"
                      className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-[var(--color-primary-studio-hover)]/5 hover:text-white rounded-lg mx-1 transition-colors group"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FaPlus className="w-4 h-4 mr-3 text-primary group-hover:scale-110 transition-transform" />
                      Create Studio
                    </Link>
                  )}
                </div>

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
}
