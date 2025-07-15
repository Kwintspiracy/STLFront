'use client';

import { useCart } from '@/context/CartContext';
import { useEffect, useRef } from 'react';
import { FaShoppingCart, FaTrash, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

interface CartDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDropdown({ isOpen, onClose }: CartDropdownProps) {
  const { state, removeFromCart } = useCart();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const getItemPrice = (item: any) => {
    const basePrice = parseFloat(item.product.price);
    let price = basePrice;
    
    if (item.license === 'commercial' && item.product.professional_license_fee) {
      price += parseFloat(item.product.professional_license_fee);
    } else if (item.license === 'extended') {
      const commercialFee = item.product.professional_license_fee ? parseFloat(item.product.professional_license_fee) : 0;
      price += commercialFee * 2;
    }
    
    return price;
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-cardbackground border border-gray-800 rounded-lg shadow-2xl z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <FaShoppingCart className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-white">Shopping Cart</h3>
          <span className="text-xs text-gray-400">
            ({state.totalItems} {state.totalItems === 1 ? 'item' : 'items'})
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white transition-colors"
          aria-label="Close cart"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>

      {/* Cart Items */}
      <div className="max-h-80 overflow-y-auto">
        {state.items.length === 0 ? (
          <div className="p-6 text-center">
            <FaShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">Your cart is empty</p>
            <button
              onClick={onClose}
              className="text-primary hover:text-[#3f6061] transition-colors text-sm"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <div className="p-2">
            {state.items.map((item) => {
              const mainImage = item.product.images?.[0]?.url || item.product.images?.[0]?.image;
              const itemPrice = getItemPrice(item);
              
              return (
                <div key={item.id} className="flex gap-3 p-2 hover:bg-primarybackground/50 rounded-lg transition-colors">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden">
                      {mainImage ? (
                        <Image
                          src={mainImage}
                          alt={item.product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <FaShoppingCart className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-gray-400 truncate">
                      by {item.product.creator.name}
                    </p>
                    
                    {/* License */}
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 capitalize">
                          {item.license}
                        </span>
                        {item.license !== 'personal' && (
                          <span className="text-xs bg-green-900/30 text-green-400 px-1 rounded">
                            {item.license}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price and Remove */}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-semibold text-primary">
                        ${formatPrice(itemPrice)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        aria-label="Remove item"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {state.items.length > 0 && (
        <div className="border-t border-gray-800 p-4">
          {/* Total */}
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-white">Total:</span>
            <span className="text-lg font-bold text-primary">
              ${formatPrice(state.totalPrice)}
            </span>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Link
              href="/cart"
              onClick={onClose}
              className="block w-full px-4 py-2 bg-primary text-black text-center rounded-lg hover:bg-[#3f6061] hover:text-secondary transition-colors font-medium"
            >
              Checkout
            </Link>
            <button
              onClick={onClose}
              className="block w-full px-4 py-2 text-gray-400 hover:text-white text-center transition-colors text-sm"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
