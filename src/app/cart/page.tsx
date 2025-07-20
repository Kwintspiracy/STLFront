"use client";

import { useState } from "react";
import { FaTrash, FaShoppingBag, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import Image from "next/image";

const licenseOptions = [
  { value: "personal", label: "Personal Use" },
  { value: "commercial", label: "Commercial Use" },
  { value: "extended", label: "Extended License" }
];

// Mock coupon codes for demonstration
const validCoupons = {
    "SAVE10": { discount: 10, type: "percentage" },
    "WELCOME5": { discount: 5, type: "fixed" },
    "STUDENT20": { discount: 20, type: "percentage" }
};

export default function CartPage() {
    const { state, removeFromCart, updateLicense } = useCart();
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number, type: string} | null>(null);
    const [couponError, setCouponError] = useState("");

    const handleLicenseChange = (id: number, value: 'personal' | 'commercial' | 'extended') => {
        updateLicense(id, value);
    };

    const handleRemoveItem = (id: number) => {
        removeFromCart(id);
    };

    const getItemPrice = (item: {
        product: {
            price: string;
            professional_license_fee?: string;
        };
        license: 'personal' | 'commercial' | 'extended';
    }) => {
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

    const subtotal = state.totalPrice;

    const calculateDiscount = () => {
        if (!appliedCoupon) return 0;
        
        if (appliedCoupon.type === "percentage") {
            return (subtotal * appliedCoupon.discount) / 100;
        } else {
            return appliedCoupon.discount;
        }
    };

    const discount = calculateDiscount();
    const total = subtotal - discount;

    const handleApplyCoupon = () => {
        const trimmedCode = couponCode.trim().toUpperCase();
        
        if (!trimmedCode) {
            setCouponError("Please enter a coupon code");
            return;
        }

        if (validCoupons[trimmedCode as keyof typeof validCoupons]) {
            const coupon = validCoupons[trimmedCode as keyof typeof validCoupons];
            setAppliedCoupon({
                code: trimmedCode,
                discount: coupon.discount,
                type: coupon.type
            });
            setCouponError("");
            setCouponCode("");
        } else {
            setCouponError("Invalid coupon code");
            setAppliedCoupon(null);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponError("");
        setCouponCode("");
    };

    return (
        <div className="bg-primarybackground min-h-screen">
            {/* Header with breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
                <div className="flex items-center gap-4 mb-4">
                    <Link 
                        href="/" 
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                        <FaArrowLeft className="w-3 h-3" />
                        Continue Shopping
                    </Link>
                </div>
                
                <div className="flex items-center gap-3">
                    <FaShoppingBag className="w-6 h-6 text-primary" />
                    <h1 className="text-2xl font-bold text-white">
                        Shopping Cart
                    </h1>
                    <span className="text-gray-400 text-sm">
                        ({state.items.length} {state.items.length === 1 ? 'item' : 'items'})
                    </span>
                </div>
            </div>

            {state.items.length === 0 ? (
                /* Empty Cart State */
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-cardbackground border border-gray-800 rounded-lg p-12 text-center">
                        <FaShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">Your cart is empty</h2>
                        <p className="text-gray-400 mb-6">Discover amazing 3D models from talented creators</p>
                        <Link 
                            href="/"
                            className="inline-flex items-center px-6 py-3 bg-primary text-black rounded-lg hover:bg-[#3f6061] hover:text-secondary transition-colors font-medium"
                        >
                            Start Shopping
                        </Link>
                    </div>
                </div>
            ) : (
                /* Two-Column Layout */
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Left Column - Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {state.items.map((item) => {
                                const mainImage = item.product.images?.[0]?.url || item.product.images?.[0]?.image;
                                const itemPrice = getItemPrice(item);
                                
                                return (
                                    <div
                                        key={item.id}
                                        className="bg-cardbackground border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
                                    >
                                        <div className="flex gap-4">
                                            {/* Product Image */}
                                            <div className="flex-shrink-0">
                                                <div className="w-20 h-20 bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                                                    {mainImage ? (
                                                        <Image
                                                            src={mainImage}
                                                            alt={item.product.name}
                                                            width={80}
                                                            height={80}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                            <FaShoppingBag className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <Link href={`/product/${item.product.id}`}>
                                                            <h3 className="font-medium text-white text-base hover:text-primary transition-colors cursor-pointer">
                                                                {item.product.name}
                                                            </h3>
                                                        </Link>
                                                        <p className="text-sm text-gray-400 mt-1">
                                                            by <span className="text-gray-300">{item.product.creator.name}</span>
                                                        </p>
                                                    </div>
                                                    
                                                    {/* Price */}
                                                    <div className="text-right">
                                                        <div className="text-lg font-bold text-primary">
                                                            ${itemPrice.toFixed(2)}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {item.license} license
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* License and Actions */}
                                                <div className="flex items-center justify-between mt-4">
                                                    {/* License Selection */}
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-xs text-gray-400 font-medium">License:</label>
                                                        <select
                                                            className="px-2 py-1 bg-primarybackground border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-primary transition-colors"
                                                            value={item.license}
                                                            onChange={(e) => handleLicenseChange(item.id, e.target.value as 'personal' | 'commercial' | 'extended')}
                                                        >
                                                            {licenseOptions.map((option) => (
                                                                <option key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Remove Button */}
                                                    <button
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors text-sm"
                                                        aria-label="Remove item"
                                                    >
                                                        <FaTrash className="w-3 h-3" />
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-6 space-y-6">
                                
                                {/* Coupon Section */}
                                <div className="bg-cardbackground border border-gray-800 rounded-lg p-4">
                                    <h3 className="font-medium text-white mb-3">Promo Code</h3>
                                    
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                            className="flex-1 px-3 py-2 bg-primarybackground border border-gray-600 rounded text-white placeholder-gray-400 text-sm focus:outline-none focus:border-primary transition-colors"
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors font-medium text-sm"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    
                                    {couponError && (
                                        <div className="mt-2 text-red-400 text-xs">
                                            {couponError}
                                        </div>
                                    )}
                                    
                                    {appliedCoupon && (
                                        <div className="mt-3 flex items-center justify-between bg-green-900/20 border border-green-500/20 px-3 py-2 rounded">
                                            <span className="text-green-400 text-xs">
                                                ✓ {appliedCoupon.code} applied
                                            </span>
                                            <button
                                                onClick={handleRemoveCoupon}
                                                className="text-red-400 hover:text-red-300 text-xs"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Order Summary */}
                                <div className="bg-cardbackground border border-gray-800 rounded-lg p-4">
                                    <h3 className="font-medium text-white mb-4">Order Summary</h3>
                                    
                                    <div className="space-y-3">
                                        {/* Subtotal */}
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Subtotal</span>
                                            <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
                                        </div>

                                        {/* Discount */}
                                        {discount > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Discount</span>
                                                <span className="text-green-400 font-medium">-${discount.toFixed(2)}</span>
                                            </div>
                                        )}

                                        {/* Divider */}
                                        <div className="border-t border-gray-700 pt-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-white font-semibold">Total</span>
                                                <div className="text-right">
                                                    <div className="text-xl font-bold text-primary">${total.toFixed(2)}</div>
                                                    <div className="text-xs text-gray-500">USD</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Checkout Button */}
                                    <button className="w-full mt-6 px-6 py-3 bg-primary text-black rounded-lg hover:bg-[#3f6061] hover:text-secondary transition-colors font-semibold">
                                        Proceed to Checkout
                                    </button>

                                    {/* Security Note */}
                                    <p className="text-xs text-gray-500 text-center mt-3">
                                        🔒 Secure checkout powered by Stripe
                                    </p>
                                </div>

                                {/* Continue Shopping */}
                                <div className="text-center">
                                    <Link 
                                        href="/"
                                        className="text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        ← Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
