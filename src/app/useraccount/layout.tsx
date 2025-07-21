'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  FaUser, 
  FaHeart, 
  FaCog, 
  FaStore,
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import type { UserAccountSection } from '@/types/user-account';

interface UserAccountLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  id: UserAccountSection;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    href: '/useraccount',
    icon: FaUser,
    description: 'Manage your personal information'
  },
  {
    id: 'wishlist',
    label: 'Wishlist',
    href: '/useraccount/wishlist',
    icon: FaHeart,
    description: 'Your saved products'
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/useraccount/settings',
    icon: FaCog,
    description: 'Account preferences and security'
  }
];

export default function UserAccountLayout({ children }: UserAccountLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin?redirect=/useraccount');
    }
  }, [isAuthenticated, isLoading, router]);

  // Determine active section
  const getActiveSection = (): UserAccountSection => {
    if (pathname === '/useraccount') return 'profile';
    if (pathname.startsWith('/useraccount/wishlist')) return 'wishlist';
    if (pathname.startsWith('/useraccount/settings')) return 'settings';
    return 'profile';
  };

  const activeSection = getActiveSection();

  const handleLogout = (): void => {
    logout();
    router.push('/');
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              My Account
            </h1>
            <p className="text-text-muted mt-1">
              Manage your profile, preferences, and account settings
            </p>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-background-hover rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <FaTimes className="w-5 h-5" />
            ) : (
              <FaBars className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className={`lg:w-64 ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-background-card border border-border rounded-xl p-6">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FaUser className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-sm text-text-muted truncate">
                    @{user.username}
                  </p>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-text-secondary hover:text-text-primary hover:bg-background-hover'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : 'text-text-muted group-hover:text-text-primary'}`} />
                      <div className="flex-1">
                        <p className={`font-medium ${isActive ? 'text-primary-foreground' : ''}`}>
                          {item.label}
                        </p>
                        <p className={`text-xs ${isActive ? 'text-primary-foreground/70' : 'text-text-muted'}`}>
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-border space-y-2">
                <Link
                  href="/studio"
                  className="flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-background-hover rounded-lg transition-colors group"
                >
                  <FaStore className="w-5 h-5 text-text-muted group-hover:text-text-primary" />
                  <span className="font-medium">My Studio</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-colors group"
                >
                  <FaSignOutAlt className="w-5 h-5 text-text-muted group-hover:text-error" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
