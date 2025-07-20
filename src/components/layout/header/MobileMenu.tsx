'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes, FaChevronRight, FaSignInAlt, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { ApiUser } from '@/types/auth';
import { MyStudioResponse } from '@/types/studio';

interface MobileMenuProps {
  className?: string;
  user?: ApiUser | null;
  isAuthenticated?: boolean;
  myStudio?: MyStudioResponse | null;
  onLogout?: () => void;
}

export default function MobileMenu({ 
  className = "",
  user,
  isAuthenticated = false,
  onLogout
}: MobileMenuProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className={`lg:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors ${className}`}
        aria-label="Toggle mobile menu"
        aria-expanded={mobileMenuOpen}
      >
        <FaBars className="w-4 h-4" />
      </button>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="fixed inset-0 bg-primarybackground/50 transition-opacity duration-300"
            onClick={toggleMobileMenu}
          />
          <div className="fixed right-0 top-0 h-screen w-80 max-w-[85vw] bg-primarybackground border-l border-gray-700/50 shadow-2xl">
            
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-sm">3D</span>
                </div>
                <span className="text-white font-bold">STLForge</span>
              </div>
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
                aria-label="Close mobile menu"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            
            {/* Mobile Navigation */}
            <nav className="p-4" role="navigation" aria-label="Mobile navigation">
              {/* User Section */}
              {!isAuthenticated ? (
                <div className="mb-4">
                  <Link
                    href="/auth/signin"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors mb-1"
                  >
                    <FaSignInAlt className="w-4 h-4" />
                    Sign In
                    <FaChevronRight className="w-3 h-3 ml-auto" />
                  </Link>
                </div>
              ) : (
                <div className="mb-4">
                  {/* User Profile */}
                  <div className="flex items-center gap-3 px-3 py-3 mb-2">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                      <FaUser className="w-4 h-4 text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">
                        {user?.username || 'User'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  {/* User Actions */}
                  <Link
                    href="/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors mb-1"
                  >
                    <FaUser className="w-4 h-4" />
                    Profile
                    <FaChevronRight className="w-3 h-3 ml-auto" />
                  </Link>

                  <Link
                    href="/settings"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors mb-1"
                  >
                    <FaCog className="w-4 h-4" />
                    Settings
                    <FaChevronRight className="w-3 h-3 ml-auto" />
                  </Link>

                  <button
                    onClick={() => {
                      onLogout?.();
                      closeMobileMenu();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors mb-1"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
              
              {/* Navigation Items */}
              <div className="border-t border-gray-700/50 pt-4">
                <Link
                  href="/browse"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors mb-1"
                >
                  <span>Browse All</span>
                  <FaChevronRight className="w-3 h-3 ml-auto" />
                </Link>
                
                <Link
                  href="/categories"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors mb-1"
                >
                  <span>Categories</span>
                  <FaChevronRight className="w-3 h-3 ml-auto" />
                </Link>
                
                <Link
                  href="/creators"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors mb-1"
                >
                  <span>Creators</span>
                  <FaChevronRight className="w-3 h-3 ml-auto" />
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
