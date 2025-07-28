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
    <header className="sticky top-0 z-40 w-full bg-background">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between" style={{ height: 'var(--header-height)' }}>
          
          {/* Left: Logo + Navigation */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-2 text-xl font-bold text-text-primary hover:text-primary transition-all duration-300 ease-in-out"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">3D</span>
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
          <div className="flex items-center gap-6">
            {/* Search Button for mobile when search should be visible */}
            {showSearch && (
              <SearchSection isVisible={false} />
            )}

            {/* Quick Actions - Hidden on mobile */}
            <div className="hidden lg:flex">
              <QuickActions 
                isAuthenticated={isAuthenticated}
                notificationCount={0}
              />
            </div>

            {/* Cart icon visible on mobile */}
            <div className="lg:hidden">
              <QuickActions 
                isAuthenticated={isAuthenticated}
                notificationCount={0}
                mobileOnly={true}
              />
            </div>

            {/* Vertical Separator - Desktop only */}
            <div className="hidden lg:block w-px h-6 bg-border"></div>

            {/* User Profile - Hidden on mobile */}
            <div className="hidden lg:block">
              {!mounted ? (
                <div className="w-8 h-8 bg-background-card rounded-full animate-pulse" />
              ) : (
                <UserMenu
                  user={user}
                  isAuthenticated={isAuthenticated}
                  myStudio={myStudio}
                  onLogout={handleLogout}
                />
              )}
            </div>

            {/* Mobile Menu Button - Always at the right on mobile */}
            <MobileMenu 
              user={user}
              isAuthenticated={isAuthenticated}
              myStudio={myStudio}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
