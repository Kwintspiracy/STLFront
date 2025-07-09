'use client';

import Link from 'next/link';
import { FaShoppingCart, FaBell, FaHeart, FaUser } from 'react-icons/fa';

interface QuickActionsProps {
  isAuthenticated: boolean;
  cartItemCount?: number;
  notificationCount?: number;
  className?: string;
}

export default function QuickActions({ 
  isAuthenticated, 
  cartItemCount = 3, 
  notificationCount = 0,
  className = "" 
}: QuickActionsProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Authenticated User Actions */}
      {isAuthenticated && (
        <>
          {/* Notifications */}
          <Link
            href="/notifications"
            className="hidden sm:flex p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors relative"
            aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} new)` : ''}`}
          >
            <FaBell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
                <span className="sr-only">{notificationCount} new notifications</span>
              </span>
            )}
          </Link>

          {/* Favorites */}
          <Link 
            href="/favorites"
            className="hidden sm:flex p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            aria-label="My favorites"
          >
            <FaHeart className="w-4 h-4" />
          </Link>

          {/* Public Profile */}
          <Link 
            href="/profile"
            className="hidden sm:flex p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            aria-label="My profile"
          >
            <FaUser className="w-4 h-4" />
          </Link>
        </>
      )}

      {/* Shopping Cart - Always visible */}
      <Link
        href="/cart"
        className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors group"
        aria-label={`Shopping cart${cartItemCount > 0 ? ` (${cartItemCount} items)` : ' (empty)'}`}
      >
        <FaShoppingCart className="w-4 h-4" />
        {cartItemCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black rounded-full text-xs font-bold flex items-center justify-center">
            {cartItemCount > 99 ? '99+' : cartItemCount}
          </span>
        )}
      </Link>
    </div>
  );
}
