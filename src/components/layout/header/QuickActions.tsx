'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FaShoppingCart, FaBell, FaHeart, FaUser } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import CartDropdown from '@/components/cart/CartDropdown';

interface QuickActionsProps {
  isAuthenticated: boolean;
  notificationCount?: number;
  className?: string;
  mobileOnly?: boolean;
}

export default function QuickActions({ 
  isAuthenticated, 
  notificationCount = 0,
  className = "",
  mobileOnly = false
}: QuickActionsProps) {
  const { state } = useCart();
  const [isCartDropdownOpen, setIsCartDropdownOpen] = useState(false);

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCartDropdownOpen(!isCartDropdownOpen);
  };

  if (mobileOnly) {
    // Mobile version - only show cart
    return (
      <div className={`flex items-center ${className}`}>
        {/* Shopping Cart - Mobile only */}
        <div className="relative">
          <button
            onClick={handleCartClick}
            className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-background-hover rounded-lg transition-colors group"
            aria-label={`Shopping cart${state.totalItems > 0 ? ` (${state.totalItems} items)` : ' (empty)'}`}
          >
            <FaShoppingCart className="w-4 h-4" />
            {state.totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs font-bold flex items-center justify-center">
                {state.totalItems > 99 ? '99+' : state.totalItems}
              </span>
            )}
          </button>

          {/* Cart Dropdown */}
          <CartDropdown 
            isOpen={isCartDropdownOpen} 
            onClose={() => setIsCartDropdownOpen(false)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Authenticated User Actions */}
      {isAuthenticated && (
        <>
          {/* Notifications */}
          <Link
            href="/notifications"
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-background-hover rounded-lg transition-colors relative"
            aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} new)` : ''}`}
          >
            <FaBell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full text-xs flex items-center justify-center">
                <span className="sr-only">{notificationCount} new notifications</span>
              </span>
            )}
          </Link>

          {/* Favorites */}
          <Link 
            href="/wishlist"
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-background-hover rounded-lg transition-colors"
            aria-label="My favorites"
          >
            <FaHeart className="w-4 h-4" />
          </Link>

          {/* Public Profile */}
          <Link 
            href="/profile"
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-background-hover rounded-lg transition-colors"
            aria-label="My profile"
          >
            <FaUser className="w-4 h-4" />
          </Link>
        </>
      )}

      {/* Shopping Cart - Always visible with dropdown */}
      <div className="relative">
        <button
          onClick={handleCartClick}
          className="relative flex items-center gap-2 p-2 text-text-secondary hover:text-text-primary hover:bg-background-hover rounded-lg transition-colors group"
          aria-label={`Shopping cart${state.totalItems > 0 ? ` (${state.totalItems} items)` : ' (empty)'}`}
        >
          <FaShoppingCart className="w-4 h-4" />
          <span className="hidden xl:block text-sm font-medium">Cart</span>
          {state.totalItems > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs font-bold flex items-center justify-center">
              {state.totalItems > 99 ? '99+' : state.totalItems}
            </span>
          )}
        </button>

        {/* Cart Dropdown */}
        <CartDropdown 
          isOpen={isCartDropdownOpen} 
          onClose={() => setIsCartDropdownOpen(false)} 
        />
      </div>
    </div>
  );
}
