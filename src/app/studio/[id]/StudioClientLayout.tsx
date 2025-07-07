'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Studio } from '@/types/studio';
import { RiMenuLine, RiCloseLine, RiTBoxLine, RiBarChartLine, RiMoneyDollarCircleLine, RiSettingsLine, RiMailLine, RiExternalLinkLine } from 'react-icons/ri';

interface StudioClientLayoutProps {
  studio: Studio;
  children: React.ReactNode;
}

export default function StudioClientLayout({ studio, children }: StudioClientLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationLinks = [
    {
      href: `/studio/${studio.id}/products`,
      label: 'Products',
      icon: RiTBoxLine,
      isActive: pathname === `/studio/${studio.id}/products`,
    },
    {
      href: `/studio/${studio.id}/statistics`,
      label: 'Statistics',
      icon: RiBarChartLine,
      isActive: pathname === `/studio/${studio.id}/statistics`,
    },
    {
      href: `/studio/${studio.id}/earnings`,
      label: 'Earnings',
      icon: RiMoneyDollarCircleLine,
      isActive: pathname === `/studio/${studio.id}/earnings`,
    },
    {
      href: `/studio/${studio.id}/settings`,
      label: 'Settings',
      icon: RiSettingsLine,
      isActive: pathname === `/studio/${studio.id}/settings`,
    },
    {
      href: `/studio/${studio.id}/inbox`,
      label: 'Inbox',
      icon: RiMailLine,
      isActive: pathname === `/studio/${studio.id}/inbox`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#131618] text-white">
      {/* Combined Header with Navigation */}
      <div className="bg-[#0F1213] border-b border-[#2A2D30] relative">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Studio Info - Far Left (aligned with website title) */}
            <div className="flex items-center space-x-3">
              {studio.badge ? (
                <img
                  src={studio.badge}
                  alt={`${studio.name} logo`}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center">
                  <span className="text-lg font-bold">{studio.name.charAt(0)}</span>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-semibold">{studio.name}</h1>
                <Link
                  href={`/public/studio/${studio.id}`}
                  className="flex items-center space-x-1 text-sm text-[#FDD811] hover:text-[#FDD811]/80 transition-colors"
                >
                  <RiExternalLinkLine className="w-4 h-4" />
                  <span>View Public Profile</span>
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 hover:bg-[#1A1C21] rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <RiCloseLine className="w-6 h-6" />
              ) : (
                <RiMenuLine className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Navigation Menu - Centered and bottom-aligned */}
          <nav className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 bottom-0">
            <div className="flex space-x-8">
              {navigationLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                      link.isActive
                        ? 'text-[#FDD811] border-[#FDD811]'
                        : 'text-gray-300 border-transparent hover:text-white hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-[#0F1213] border-r border-[#2A2D30] z-50 transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b border-[#2A2D30]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {studio.badge ? (
                <img
                  src={studio.badge}
                  alt={`${studio.name} logo`}
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gray-600 flex items-center justify-center">
                  <span className="text-xs font-bold">{studio.name.charAt(0)}</span>
                </div>
              )}
              <span className="text-lg font-semibold">{studio.name}</span>
            </div>
            <button
              onClick={closeMobileMenu}
              className="p-2 hover:bg-[#1A1C21] rounded-lg transition-colors"
              aria-label="Close navigation menu"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="p-4">
          <div className="mb-4">
            <Link
              href={`/public/studio/${studio.id}`}
              onClick={closeMobileMenu}
              className="flex items-center space-x-2 text-sm text-[#FDD811] hover:text-[#FDD811]/80 transition-colors"
            >
              <RiExternalLinkLine className="w-4 h-4" />
              <span>View Public Profile</span>
            </Link>
          </div>
          <ul className="space-y-2">
            {navigationLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      link.isActive
                        ? 'bg-[#1A1C21] text-[#FDD811] border border-[#FDD811]/20'
                        : 'hover:bg-[#1A1C21] text-gray-300 hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}
