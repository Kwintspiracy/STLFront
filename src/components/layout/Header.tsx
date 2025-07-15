'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useStudio } from '@/context/StudioContext';
import { useEffect, useState } from 'react';
import { Navigation, SearchSection, QuickActions, UserMenu, MobileMenu } from './header/index';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { myStudio } = useStudio();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const isHomePage = pathname === '/';
  const isStudioPage = pathname.startsWith('/studio/');
  const showSearch = !isHomePage && !isStudioPage;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
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
            <Navigation />
          </div>

          {/* Center: Search Bar (non-homepage and non-studio pages) */}
          {showSearch && (
            <SearchSection isVisible={true} />
          )}

          {/* Right: Actions + User */}
          <div className="flex items-center gap-3">
            {/* Search Button for mobile when search should be visible */}
            {showSearch && (
              <SearchSection isVisible={false} />
            )}

            {/* Quick Actions */}
            <QuickActions 
              isAuthenticated={isAuthenticated}
              notificationCount={0}
            />

            {/* Mobile Menu Button */}
            <MobileMenu />

            {/* User Profile */}
            {!mounted ? (
              <div className="w-8 h-8 bg-gray-800 rounded-full animate-pulse" />
            ) : (
              <UserMenu
                user={user}
                isAuthenticated={isAuthenticated}
                myStudio={myStudio}
                onLogout={handleLogout}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
