'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Studio } from '@/types/product';
import { RiMenuLine, RiCloseLine, RiDashboardLine, RiTBoxLine, RiSettingsLine } from 'react-icons/ri';

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
      href: `/studio/${studio.id}`,
      label: 'Dashboard',
      icon: RiDashboardLine,
      isActive: pathname === `/studio/${studio.id}`,
    },
    {
      href: `/studio/${studio.id}/products`,
      label: 'Products',
      icon: RiTBoxLine,
      isActive: pathname === `/studio/${studio.id}/products`,
    },
    {
      href: `/studio/${studio.id}/settings`,
      label: 'Settings',
      icon: RiSettingsLine,
      isActive: pathname === `/studio/${studio.id}/settings`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#131618] text-white">
      {/* Mobile Header */}
      <div className="lg:hidden bg-[#0F1213] border-b border-[#2A2D30] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={studio.creatorlogo}
            alt={`${studio.name} logo`}
            className="w-8 h-8 rounded-lg object-cover"
          />
          <span className="text-lg font-semibold">{studio.name}</span>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="p-2 hover:bg-[#1A1C21] rounded-lg transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? (
            <RiCloseLine className="w-6 h-6" />
          ) : (
            <RiMenuLine className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-[#0F1213] border-r border-[#2A2D30] z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="p-4 border-b border-[#2A2D30]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={studio.creatorlogo}
                alt={`${studio.name} logo`}
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold">{studio.name}</h2>
                <p className="text-sm text-gray-400">Studio Dashboard</p>
              </div>
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
          <ul className="space-y-2">
            {navigationLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${link.isActive
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

      {/* Desktop Layout */}
      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-100 bg-[#0F1213] border-r border-[#2A2D30] min-h-screen">
          <div className="p-6 border-b border-[#2A2D30]">
            <div className="flex items-center space-x-3">
              <img
                src={studio.creatorlogo}
                alt={`${studio.name} logo`}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold">{studio.name}</h2>
                <p className="text-sm text-gray-400">Studio Dashboard</p>
              </div>
            </div>
          </div>

          <nav className="p-6">
            <ul className="space-y-2">
              {navigationLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${link.isActive
                          ? 'bg-[#1A1C21] text-[#FDD811] border border-[#FDD811]/20'
                          : 'hover:bg-[#1A1C21] text-gray-300 hover:text-white'
                        }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Studio Stats or Quick Actions */}
          <div className="px-6 mt-auto pt-6 pb-6 border-t border-[#2A2D30]">
            <div className="bg-[#1A1C21] rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Products</span>
                  <span className="text-[#FDD811]">50</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Sales</span>
                  <span className="text-[#FDD811]">$4998
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Studio Stats or Quick Actions */}
          <div className="px-6 mt-auto pb-6">
            <div className="bg-[#1A1C21] rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">June 2025</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Product Sold</span>
                  <span className="text-[#FDD811]">90</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Sales</span>
                  <span className="text-[#FDD811]">$470</span>
                </div>
              </div>
            </div>
          </div>

          {/* Studio Stats or Quick Actions */}
          <div className="px-6 mt-auto pb-6">
            <div className="bg-[#1A1C21] rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Payout</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Product Sold</span>
                  <span className="text-[#FDD811]">90</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Sales</span>
                  <span className="text-[#FDD811]">$470</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <main className="min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}