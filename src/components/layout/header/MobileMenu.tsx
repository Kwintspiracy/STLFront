'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBars, FaTimes, FaHome, FaFire, FaCrown, FaChevronRight } from 'react-icons/fa';

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavigationItem[] = [
  { href: '/', label: 'Home', icon: FaHome },
  { href: '/trending', label: 'Trending', icon: FaFire },
  { href: '/featured', label: 'Featured', icon: FaCrown },
];

interface MobileMenuProps {
  className?: string;
}

export default function MobileMenu({ className = "" }: MobileMenuProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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
          <div className="fixed left-0 top-0 h-screen w-80 max-w-[85vw] bg-primarybackground border-r border-gray-700/50 shadow-2xl">
            
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
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors mb-1 ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    <FaChevronRight className="w-3 h-3 ml-auto" />
                  </Link>
                );
              })}
              
              {/* Additional Mobile Menu Items */}
              <div className="border-t border-gray-700/50 mt-4 pt-4">
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
