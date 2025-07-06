'use client';

export const dynamic = 'force-dynamic';
import { getProductById } from "@/lib/api/products";
import { notFound } from "next/navigation";
import CardCartButton from "@/components/card/CardCartButton";
import { RiShoppingCart2Fill, RiDownloadLine } from "react-icons/ri";
import TagPill from "@/components/card/TagPill";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import { useState, useEffect } from "react";
import { Product } from "@/types/product";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage(props: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLicense, setSelectedLicense] = useState<'personal' | 'commercial'>('personal');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const { id } = await props.params;
        const productData = await getProductById(Number(id));
        if (!productData) {
          notFound();
        }
        setProduct(productData);
      } catch (error) {
        console.error('Error loading product:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [props.params]);

  const calculateCreatorEarnings = (price: string) => {
    const numPrice = parseFloat(price);
    return (numPrice * 0.7).toFixed(2); // Assuming 70% goes to creator
  };

  const getCurrentPrice = () => {
    if (!product) return '0';
    const basePrice = parseFloat(product.price);
    return selectedLicense === 'commercial' ? (basePrice * 2).toFixed(2) : product.price;
  };

  if (loading) {
    return (
      <main className="max-w-[1440px] mx-auto text-white px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="animate-pulse">
          {/* Breadcrumb skeleton */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 py-4 sm:py-6">
            <div className="h-6 bg-gray-700 rounded-full w-16"></div>
            <div className="h-6 bg-gray-700 rounded-full w-20"></div>
            <div className="h-6 bg-gray-700 rounded-full w-14"></div>
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
            <div className="lg:col-span-3">
              <div className="aspect-square bg-gray-700 rounded-lg"></div>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              <div className="h-12 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) return null;

  return (
    <main className="max-w-[1440px] mx-auto text-white px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex flex-wrap items-center gap-2 sm:gap-4 py-4 sm:py-6" aria-label="Breadcrumb">
        {product.tag.map((tag: any) => (
          <TagPill key={tag.id} tag={tag.name} />
        ))}
      </nav>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">

        {/* Product Image Gallery */}
        <div className="lg:col-span-3">
          <ProductImageGallery images={product.images} name={product.name} />
        </div>

        {/* Product Information */}
        <div className="lg:col-span-2 space-y-6">

          {/* Product Header */}
          <div className="space-y-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight text-white">
              {product.name}
            </h1>

            {/* Creator Info */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <img
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg ring-2 ring-gray-600 object-cover"
                  src={imageError ? '/placeholder-avatar.png' : product.creator.creatorlogo}
                  alt={`${product.creator.name} logo`}
                  onError={() => setImageError(true)}
                />
              </div>
              <div>
                <p className="text-white text-sm sm:text-base font-medium">
                  by {product.creator.name}
                </p>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Creator
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-700"></div>

          {/* Pricing Section */}
          <div className="bg-gray-800/50 rounded-lg p-4 sm:p-6 space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-white">
                ${getCurrentPrice()}
              </span>
              <span className="text-gray-400 text-sm">USD</span>
            </div>
            <p className="text-primary text-sm font-medium">
              ${calculateCreatorEarnings(getCurrentPrice())} goes to the creator
            </p>
          </div>

          {/* License Selection */}
          <div className="space-y-4">
            <h3 className="text-white text-base sm:text-lg font-semibold">
              Select License Type
            </h3>

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

          {/* Add to Cart Button */}
          <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 p-4 -mx-4 lg:relative lg:bg-transparent lg:border-0 lg:p-0 lg:mx-0">
            <CardCartButton href="/cart/" className="w-full">
              <RiShoppingCart2Fill className="w-5 h-5" />
              <span className="font-semibold">Add to Cart - ${getCurrentPrice()}</span>
            </CardCartButton>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-700"></div>

          {/* Files Section */}
          <div className="space-y-4">
            <h2 className="text-white text-lg sm:text-xl font-bold flex items-center gap-2">
              <RiDownloadLine className="w-5 h-5 text-primary" />
              Included Files
            </h2>

            <div className="space-y-2">
              {Array.isArray(product.files) && product.files.length > 0 ? (
                product.files.map((file: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700"
                  >
                    <RiDownloadLine className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-200 text-sm font-medium truncate">
                      {file}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-sm italic p-3 bg-gray-800/30 rounded-lg">
                  No downloadable files available.
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-white text-lg sm:text-xl font-bold">
              Description
            </h2>
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-gray-300 leading-relaxed">
                {product.description || "No description available for this product."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
