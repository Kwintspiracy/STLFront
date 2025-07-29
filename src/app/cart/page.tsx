"use client";

import { useState } from "react";
import { FaTrash, FaShoppingBag, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { checkoutService, type CheckoutRequest } from "@/lib/api/checkoutService";

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
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutError, setCheckoutError] = useState("");

    const handleLicenseChange = async (backendId: number, value: 'personal' | 'commercial' | 'extended') => {
        const includeProlicense = value === 'commercial' || value === 'extended';
        await updateLicense(backendId, includeProlicense);
    };

    const handleRemoveItem = async (backendId: number) => {
        await removeFromCart(backendId);
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

    const handleCheckout = async () => {
        if (state.items.length === 0) return;
        
        console.log('🛒 CART CHECKOUT - Starting checkout process');
        console.log('📊 Cart state:', {
            itemsCount: state.items.length,
            totalPrice: state.totalPrice,
            isLoading: state.isLoading,
            cartCode: state.cartCode
        });
        
        setIsCheckingOut(true);
        setCheckoutError("");
        
        try {
            // Log cart items details
            console.log('📦 Cart items details:');
            state.items.forEach((item, index) => {
                console.log(`  Item ${index + 1}:`, {
                    id: item.id,
                    backendId: item.backendId,
                    productId: item.product.id,
                    productName: item.product.name,
                    license: item.license,
                    includeprolicense: item.includeprolicense,
                    price: item.product.price,
                    professionalFee: item.product.professional_license_fee
                });
            });
            
            // Prepare checkout data
            const checkoutData: CheckoutRequest = {
                items: state.items.map(item => ({
                    product_id: item.product.id,
                    license: item.license,
                    quantity: 1 // Assuming quantity is always 1 for digital products
                })),
                coupon_code: appliedCoupon?.code
            };

            console.log('💰 Pricing details:');
            console.log('  Subtotal:', subtotal);
            console.log('  Applied coupon:', appliedCoupon);
            console.log('  Discount:', discount);
            console.log('  Final total:', total);

            // Call the checkout service
            const response = await checkoutService.createCheckoutSession(checkoutData);
            
            console.log('✅ CHECKOUT SUCCESS - Response received:');
            console.log('📥 Response type:', typeof response);
            console.log('📥 Response keys:', Object.keys(response));
            console.log('📥 Has data object:', 'data' in response);
            console.log('📥 Has data.url:', response.data && 'url' in response.data);
            console.log('📥 data.url value:', response.data?.url);
            console.log('📥 data.url type:', typeof response.data?.url);
            console.log('📥 data.url length:', response.data?.url?.length);
            
            // Redirect to Stripe checkout URL
            if (response.data?.url) {
                console.log('🔄 Redirecting to:', response.data.url);
                window.location.href = response.data.url;
            } else {
                console.error('❌ No data.url in response:', response);
                throw new Error('No checkout URL received from server');
            }
            
        } catch (error: unknown) {
            console.error('🛒 CART CHECKOUT ERROR - Detailed error info:');
            console.error('❌ Error type:', typeof error);
            
            // Type guard for error object
            const isErrorWithMessage = (err: unknown): err is Error => {
                return err instanceof Error;
            };
            
            const isAxiosError = (err: unknown): err is { response?: { status: number; data?: { message?: string }; statusText: string; headers: unknown } } => {
                return typeof err === 'object' && err !== null && 'response' in err;
            };
            
            if (isErrorWithMessage(error)) {
                console.error('❌ Error constructor:', error.constructor.name);
                console.error('❌ Error message:', error.message);
                console.error('❌ Error stack:', error.stack);
            }
            
            if (isAxiosError(error) && error.response) {
                console.error('❌ HTTP Response error:');
                console.error('  Status:', error.response.status);
                console.error('  Status text:', error.response.statusText);
                console.error('  Headers:', error.response.headers);
                console.error('  Data:', error.response.data);
                
                // Handle different types of errors
                if (error.response.status === 401) {
                    setCheckoutError("Please sign in to continue with checkout");
                } else if (error.response.status === 400) {
                    setCheckoutError(error.response.data?.message || "Invalid checkout data");
                } else if (error.response.status === 500) {
                    setCheckoutError("Server error. Please try again later");
                } else {
                    setCheckoutError("Failed to process checkout. Please try again");
                }
            } else {
                setCheckoutError("Failed to process checkout. Please try again");
            }
        } finally {
            setIsCheckingOut(false);
            console.log('🛒 CART CHECKOUT - Process completed');
        }
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
                                                            onChange={(e) => handleLicenseChange(item.backendId, e.target.value as 'personal' | 'commercial' | 'extended')}
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
                                                        onClick={() => handleRemoveItem(item.backendId)}
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

                                    {/* Checkout Error */}
                                    {checkoutError && (
                                        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/20 rounded text-red-400 text-sm">
                                            {checkoutError}
                                        </div>
                                    )}

                                    {/* Checkout Button */}
                                    <button 
                                        onClick={handleCheckout}
                                        disabled={isCheckingOut || state.items.length === 0}
                                        className="w-full mt-6 px-6 py-3 bg-primary text-black rounded-lg hover:bg-[#3f6061] hover:text-secondary transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isCheckingOut ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                                Processing...
                                            </div>
                                        ) : (
                                            'Proceed to Checkout'
                                        )}
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
