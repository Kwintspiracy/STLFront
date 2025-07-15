'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaHeart, 
  FaHeartBroken, 
  FaShoppingCart, 
  FaDownload,
  FaEye,
  FaTrash,
  FaFilter,
  FaSort
} from 'react-icons/fa';
import { Product } from '@/types/product';
import TagPill from '@/components/card/TagPill';

interface WishlistItem {
  id: number;
  product: Product;
  added_at: string;
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'price'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'free' | 'paid'>('all');

  // Mock wishlist data - replace with actual API call
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockWishlist: WishlistItem[] = [
          {
            id: 1,
            added_at: '2024-01-15T10:30:00Z',
            product: {
              id: 1,
              name: 'Modern Desk Organizer',
              description: 'A sleek and functional desk organizer perfect for your workspace.',
              price: '12.99',
              professional_license_fee: '24.99',
              creator: {
                id: 1,
                name: 'Design Studio Pro',
                badge: undefined
              },
              status: 'published',
              zip_size: '2.5 MB',
              zip_size_bytes: 2621440,
              created_at: '2024-01-10T08:00:00Z',
              updated_at: '2024-01-10T08:00:00Z',
              tag: [
                { id: 1, name: 'Office', slug: 'office' },
                { id: 2, name: 'Organizer', slug: 'organizer' }
              ],
              images: [
                {
                  id: 1,
                  url: 'https://picsum.photos/seed/product1/400/400',
                  rank: 1,
                  title: 'Main view'
                }
              ],
              stl_files: []
            }
          },
          {
            id: 2,
            added_at: '2024-01-12T14:20:00Z',
            product: {
              id: 2,
              name: 'Miniature Dragon',
              description: 'Detailed miniature dragon figure for tabletop gaming.',
              price: '0.00',
              professional_license_fee: '0.00',
              creator: {
                id: 2,
                name: 'Fantasy Minis',
                badge: undefined
              },
              status: 'published',
              zip_size: '5.1 MB',
              zip_size_bytes: 5349376,
              created_at: '2024-01-08T12:00:00Z',
              updated_at: '2024-01-08T12:00:00Z',
              tag: [
                { id: 3, name: 'Gaming', slug: 'gaming' },
                { id: 4, name: 'Miniature', slug: 'miniature' }
              ],
              images: [
                {
                  id: 2,
                  url: 'https://picsum.photos/seed/product2/400/400',
                  rank: 1,
                  title: 'Dragon view'
                }
              ],
              stl_files: []
            }
          },
          {
            id: 3,
            added_at: '2024-01-10T09:15:00Z',
            product: {
              id: 3,
              name: 'Phone Stand Adjustable',
              description: 'Adjustable phone stand with multiple viewing angles.',
              price: '8.50',
              professional_license_fee: '15.00',
              creator: {
                id: 3,
                name: 'Tech Accessories',
                badge: undefined
              },
              status: 'published',
              zip_size: '1.8 MB',
              zip_size_bytes: 1887437,
              created_at: '2024-01-05T16:30:00Z',
              updated_at: '2024-01-05T16:30:00Z',
              tag: [
                { id: 5, name: 'Tech', slug: 'tech' },
                { id: 6, name: 'Accessory', slug: 'accessory' }
              ],
              images: [
                {
                  id: 3,
                  url: 'https://picsum.photos/seed/product3/400/400',
                  rank: 1,
                  title: 'Phone stand'
                }
              ],
              stl_files: []
            }
          }
        ];
        
        setWishlistItems(mockWishlist);
      } catch (error) {
        console.error('Error loading wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, []);

  const removeFromWishlist = async (itemId: number) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setWishlistItems(items => items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const isFreeProduct = (product: Product) => {
    return parseFloat(product.price) === 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredAndSortedItems = wishlistItems
    .filter(item => {
      if (filterBy === 'free') return isFreeProduct(item.product);
      if (filterBy === 'paid') return !isFreeProduct(item.product);
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.product.name.localeCompare(b.product.name);
        case 'price':
          return parseFloat(a.product.price) - parseFloat(b.product.price);
        case 'date':
        default:
          return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
      }
    });

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto text-white px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-4">
                <div className="aspect-square bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto text-white px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <FaHeart className="text-primary" />
            My Wishlist
          </h1>
          <p className="text-gray-400 mt-1">
            {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {/* Filters and Sort */}
        {wishlistItems.length > 0 && (
          <div className="flex gap-3">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as 'all' | 'free' | 'paid')}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="all">All Items</option>
              <option value="free">Free Only</option>
              <option value="paid">Paid Only</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'price')}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
            </select>
          </div>
        )}
      </div>

      {/* Wishlist Content */}
      {filteredAndSortedItems.length === 0 ? (
        <div className="text-center py-16">
          <FaHeartBroken className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {wishlistItems.length === 0 ? 'Your wishlist is empty' : 'No items match your filters'}
          </h2>
          <p className="text-gray-400 mb-6">
            {wishlistItems.length === 0 
              ? 'Start exploring and add products you love to your wishlist!'
              : 'Try adjusting your filters to see more items.'
            }
          </p>
          {wishlistItems.length === 0 && (
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black rounded-lg font-medium hover:bg-primary/80 transition-colors"
            >
              <FaEye className="w-4 h-4" />
              Browse Products
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedItems.map((item) => (
            <div
              key={item.id}
              className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors group"
            >
              {/* Product Image */}
              <div className="relative aspect-square">
                <Link href={`/product/${item.product.id}`}>
                  <Image
                    src={item.product.images[0]?.url || 'https://picsum.photos/400/400'}
                    alt={item.product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                
                {/* Remove from wishlist button */}
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove from wishlist"
                >
                  <FaTrash className="w-3 h-3" />
                </button>

                {/* Free badge */}
                {isFreeProduct(item.product) && (
                  <div className="absolute top-3 left-3 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                    FREE
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <Link
                  href={`/product/${item.product.id}`}
                  className="block hover:text-primary transition-colors"
                >
                  <h3 className="font-semibold mb-2 line-clamp-2">
                    {item.product.name}
                  </h3>
                </Link>

                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {item.product.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.product.tag.slice(0, 2).map((tag) => (
                    <TagPill key={tag.id} tag={tag.name} />
                  ))}
                  {item.product.tag.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{item.product.tag.length - 2} more
                    </span>
                  )}
                </div>

                {/* Creator */}
                <p className="text-gray-500 text-sm mb-3">
                  by {item.product.creator.name}
                </p>

                {/* Price and Actions */}
                <div className="flex items-center justify-between">
                  <div>
                    {isFreeProduct(item.product) ? (
                      <span className="text-green-400 font-semibold">FREE</span>
                    ) : (
                      <span className="text-white font-semibold">
                        ${item.product.price}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/product/${item.product.id}`}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
                  >
                    {isFreeProduct(item.product) ? (
                      <>
                        <FaDownload className="w-3 h-3" />
                        Download
                      </>
                    ) : (
                      <>
                        <FaShoppingCart className="w-3 h-3" />
                        Add to Cart
                      </>
                    )}
                  </Link>
                </div>

                {/* Added date */}
                <p className="text-gray-500 text-xs mt-3">
                  Added {formatDate(item.added_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
