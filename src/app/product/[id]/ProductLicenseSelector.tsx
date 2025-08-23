'use client';

import { useState } from 'react';
import { RiShoppingCart2Fill, RiDownloadLine } from "react-icons/ri";
import { FaCheck } from "react-icons/fa";
import { useCart } from '@/context/CartContext';
import { Product, getPersonalPrice, getCommercialPrice, hasCommercialLicense, getPersonalLicense, getCommercialLicense } from "@/types/product";

interface ProductLicenseSelectorProps {
  product: Product;
  hasCommercialLicense: boolean;
  isFreeProduct: boolean;
}

export default function ProductLicenseSelector({
  product,
  hasCommercialLicense: hasCommercialLicenseProp,
  isFreeProduct
}: ProductLicenseSelectorProps) {
  const [selectedLicense, setSelectedLicense] = useState<'personal' | 'commercial'>('personal');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Cart functionality
  const { addToCart, isProductInCart } = useCart();
  const isInCart = isProductInCart(product.id);

  // Use new helper functions for pricing
  const hasCommercial = hasCommercialLicense(product);
  const personalPrice = getPersonalPrice(product);
  const commercialPrice = getCommercialPrice(product);
  const personalLicense = getPersonalLicense(product);
  const commercialLicense = getCommercialLicense(product);

  const getCurrentPrice = () => {
    if (selectedLicense === 'commercial' && commercialPrice) {
      return commercialPrice;
    }
    return personalPrice;
  };

  const getCurrentLicense = () => {
    if (selectedLicense === 'commercial') {
      return commercialLicense;
    }
    return personalLicense;
  };

  const calculateCreatorEarnings = (price: string) => {
    const numPrice = parseFloat(price);
    return (numPrice * 0.7).toFixed(2); // Assuming 70% goes to creator
  };

  const handleAddToCart = async () => {
    if (isInCart || isAddingToCart || isFreeProduct) return;
    
    setIsAddingToCart(true);
    
    try {
      // Pass the license information to addToCart
      const includeProlicense = selectedLicense === 'commercial';
      await addToCart(product, includeProlicense);
      setIsAddingToCart(false);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setIsAddingToCart(false);
    }
  };

  const handleDownload = () => {
    // For free products, handle download logic here
    console.log('Download product:', product.name);
    // You can implement actual download logic here
  };

  return (
    <>
      {/* License Selection - Only show if commercial license is available */}
      {hasCommercial && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedLicense('personal')}
              className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 text-left ${selectedLicense === 'personal'
                ? 'border-primary bg-primary/10 text-white shadow-lg'
                : 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-800/30'
                }`}
              aria-pressed={selectedLicense === 'personal'}
            >
              <div className="font-medium">Personal</div>
              <div className="text-xs text-gray-400 mt-1">For personal use only</div>
            </button>

            <button
              onClick={() => setSelectedLicense('commercial')}
              className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 text-left ${selectedLicense === 'commercial'
                ? 'border-primary bg-primary/10 text-white shadow-lg'
                : 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-800/30'
                }`}
              aria-pressed={selectedLicense === 'commercial'}
            >
              <div className="font-medium">Commercial</div>
              <div className="text-xs text-gray-400 mt-1">For business use</div>
            </button>
          </div>

          {/* License Description */}
          <div className="bg-gray-900/50 rounded-lg p-4 text-sm text-gray-300 leading-relaxed">
            {selectedLicense === 'personal' ? (
              <>
                <strong className="text-white">Personal License:</strong> Print and use for personal projects only.
                Files and printed models cannot be distributed, shared, or sold.
              </>
            ) : (
              <>
                <strong className="text-white">Commercial License:</strong> Use for commercial projects,
                including selling printed models. Includes rights for business use and resale.
              </>
            )}
          </div>
        </div>
      )}

      {/* Pricing Section */}
      <div className="bg-gray-800/50 rounded-lg p-4 sm:p-6 space-y-3">
        <div className="flex items-baseline gap-2">
          {isFreeProduct ? (
            <span className="text-2xl sm:text-3xl font-bold text-green-400">
              FREE
            </span>
          ) : (
            <>
              <span className="text-2xl sm:text-3xl font-bold text-white">
                ${getCurrentPrice()}
              </span>
              <span className="text-gray-400 text-sm">USD</span>
            </>
          )}
        </div>
        {!isFreeProduct && (
          <p className="text-primary text-sm font-medium">
            ${calculateCreatorEarnings(getCurrentPrice())} goes to the creator
          </p>
        )}
        {isFreeProduct && (
          <p className="text-green-400 text-sm font-medium">
            This product is available for free download
          </p>
        )}
      </div>

      {/* Single license info when no commercial license available */}
      {!hasCommercial && (
        <div className="space-y-4">
          <h3 className="text-white text-base sm:text-lg font-semibold">
            License Information
          </h3>
          <div className="bg-gray-900/50 rounded-lg p-4 text-sm text-gray-300 leading-relaxed">
            <strong className="text-white">Personal License:</strong> Print and use for personal projects only.
            Files and printed models cannot be distributed, shared, or sold.
            {!isFreeProduct && (
              <div className="mt-2 text-gray-400">
                Commercial licensing is not available for this product.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 p-4 -mx-4 lg:relative lg:bg-transparent lg:border-0 lg:p-0 lg:mx-0">
        <button
          onClick={isFreeProduct ? handleDownload : handleAddToCart}
          disabled={!isFreeProduct && (isAddingToCart || isInCart)}
          className={`w-full px-6 py-4 rounded-lg flex items-center justify-center gap-3 font-semibold text-lg transition-all duration-300 ${
            isFreeProduct
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : isInCart
                ? 'bg-green-500 cursor-default text-white'
                : isAddingToCart
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-[#324FEE] hover:bg-[#2940d9] text-white hover:-translate-y-0.5'
          }`}
          aria-label={
            isFreeProduct 
              ? "Download product" 
              : isInCart 
                ? "Product in cart" 
                : "Add to cart"
          }
        >
          {isFreeProduct ? (
            <>
              <RiDownloadLine className="w-6 h-6" />
              <span>DOWNLOAD</span>
            </>
          ) : isInCart ? (
            <>
              <FaCheck className="w-6 h-6" />
              <span>Added to Cart</span>
            </>
          ) : isAddingToCart ? (
            <>
              <FaCheck className="w-6 h-6" />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <RiShoppingCart2Fill className="w-6 h-6" />
              <span>Add to Cart - ${getCurrentPrice()}</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
