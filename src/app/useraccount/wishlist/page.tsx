'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FaHeart, 
  FaTrash, 
  FaShoppingCart, 
  FaEye,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaSearch,
  FaUser
} from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { WishlistItem } from '@/types/user-account';

type SortOption = 'newest' | 'oldest' | 'name' | 'price_low' | 'price_high';
type FilterOption = 'all' | 'free' | 'paid';

export default function UserAccountWishlistPage() {
  const { isAuthenticated } = useAuth();
  const { showError, showSuccess } = useToast();
  
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [removingItems, setRemovingItems] = useState<Set<number>>(new Set());

  // Load wishlist data
  useEffect(() => {
    const loadWishlist = async (): Promise<void> => {
      try {
        // Mock wishlist data - replace with actual API call
        const mockWishlistItems: WishlistItem[] = [
          {
            id: 1,
            product_id: 101,
            added_date: '2024-01-15T10:30:00Z',
            product: {
              id: 101,
              name: 'Dragon Miniature',
              price: '4.99',
              images: [
                {
                  id: 1,
                  image: '/imgs/search_bg.jpg',
                  title: 'Dragon Main',
                  rank: 1
                }
              ],
              creator: {
                id: 1,
                name: 'Fantasy Studio',
                badge: '/imgs/search_bg.jpg'
              },
              category: [
                {
                  id: 1,
                  name: 'Miniatures',
                  slug: 'miniatures'
                }
              ],
              is_free: false,
              rating: 4.8,
              download_count: 1250
            }
          },
          {
            id: 2,
            product_id: 102,
            added_date: '2024-01-10T14:20:00Z',
            product: {
              id: 102,
              name: 'Decorative Vase',
              price: '0.00',
              images: [
                {
                  id: 2,
                  image: '/imgs/search_bg.jpg',
                  title: 'Vase Main',
                  rank: 1
                }
              ],
              creator: {
                id: 2,
                name: 'Home Decor Pro'
              },
              category: [
                {
                  id: 2,
                  name: 'Home & Garden',
                  slug: 'home-garden'
                }
              ],
              is_free: true,
              rating: 4.5,
              download_count: 890
            }
          }
        ];

        setWishlistItems(mockWishlistItems);
      } catch (error) {
        console.error('Error loading wishlist:', error);
        showError('Failed to load wishlist items');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadWishlist();
    }
  }, [isAuthenticated, showError]);

  const handleRemoveFromWishlist = async (itemId: number): Promise<void> => {
    setRemovingItems(prev => new Set(prev).add(itemId));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      showSuccess('Item removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showError('Failed to remove item from wishlist');
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleSortChange = (newSort: SortOption): void => {
    setSortBy(newSort);
  };

  const handleFilterChange = (newFilter: FilterOption): void => {
    setFilterBy(newFilter);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price: string): string => {
    const numPrice = parseFloat(price);
    return numPrice === 0 ? 'Free' : `€${numPrice.toFixed(2)}`;
  };

  // Filter and sort items
  const filteredAndSortedItems = wishlistItems
    .filter(item => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.product.name.toLowerCase().includes(query);
        const matchesCreator = item.product.creator.name.toLowerCase().includes(query);
        const matchesCategory = item.product.category.some(cat => 
          cat.name.toLowerCase().includes(query)
        );
        
        if (!matchesName && !matchesCreator && !matchesCategory) {
          return false;
        }
      }

      // Price filter
      if (filterBy === 'free' && !item.product.is_free) return false;
      if (filterBy === 'paid' && item.product.is_free) return false;

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.added_date).getTime() - new Date(a.added_date).getTime();
        case 'oldest':
          return new Date(a.added_date).getTime() - new Date(b.added_date).getTime();
        case 'name':
          return a.product.name.localeCompare(b.product.name);
        case 'price_low':
          return parseFloat(a.product.price) - parseFloat(b.product.price);
        case 'price_high':
          return parseFloat(b.product.price) - parseFloat(a.product.price);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-background-hover rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-background-card rounded-lg p-4">
                <div className="aspect-square bg-background-hover rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-background-hover rounded w-3/4"></div>
                  <div className="h-3 bg-background-hover rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">My Wishlist</h2>
          <p className="text-text-muted mt-1">
            {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search wishlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary w-full sm:w-64"
          />
        </div>
      </div>

      {/* Filters and Sort */}
      {wishlistItems.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-background-card border border-border rounded-lg">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="w-4 h-4 text-text-muted" />
            <span className="text-sm font-medium text-text-primary">Filter:</span>
            <select
              value={filterBy}
              onChange={(e) => handleFilterChange(e.target.value as FilterOption)}
              className="bg-background border border-border rounded px-3 py-1 text-text-primary text-sm focus:outline-none focus:border-primary"
            >
              <option value="all">All Items</option>
              <option value="free">Free Only</option>
              <option value="paid">Paid Only</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            {sortBy === 'newest' || sortBy === 'oldest' ? (
              <FaSortAmountDown className="w-4 h-4 text-text-muted" />
            ) : (
              <FaSortAmountUp className="w-4 h-4 text-text-muted" />
            )}
            <span className="text-sm font-medium text-text-primary">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="bg-background border border-border rounded px-3 py-1 text-text-primary text-sm focus:outline-none focus:border-primary"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      {filteredAndSortedItems.length === 0 ? (
        <div className="text-center py-12">
          <FaHeart className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-text-primary">
            {wishlistItems.length === 0 ? 'Your wishlist is empty' : 'No items match your filters'}
          </h2>
          <p className="text-text-muted mb-6">
            {wishlistItems.length === 0
              ? 'Start exploring and add products you love to your wishlist!'
              : 'Try adjusting your filters to see more items.'
            }
          </p>
          {wishlistItems.length === 0 && (
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/80 transition-colors"
            >
              <FaSearch className="w-4 h-4" />
              Explore Products
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedItems.map((item) => (
            <div key={item.id} className="bg-background-card border border-border rounded-lg overflow-hidden group hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="relative aspect-square">
                <Image
                  src={item.product.images[0]?.image || '/placeholder-image.jpg'}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
                
                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Link
                    href={`/product/${item.product.id}`}
                    className="p-2 bg-background-card text-text-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                    title="View product"
                  >
                    <FaEye className="w-4 h-4" />
                  </Link>
                  
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    disabled={removingItems.has(item.id)}
                    className="p-2 bg-error text-error-foreground rounded-full hover:bg-error/80 transition-colors disabled:opacity-50"
                    title="Remove from wishlist"
                  >
                    {removingItems.has(item.id) ? (
                      <div className="w-4 h-4 border-2 border-error-foreground border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FaTrash className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Free Badge */}
                {item.product.is_free && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-success text-success-foreground text-xs font-medium rounded">
                    FREE
                  </div>
                )}

                {/* Price */}
                <div className="absolute top-2 right-2 px-2 py-1 bg-background-card/90 text-text-primary text-sm font-medium rounded">
                  {formatPrice(item.product.price)}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-text-primary mb-2 line-clamp-2">
                  {item.product.name}
                </h3>
                
                <div className="flex items-center gap-2 mb-2">
                  {item.product.creator.badge ? (
                    <Image
                      src={item.product.creator.badge}
                      alt={item.product.creator.name}
                      width={20}
                      height={20}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-background-hover flex items-center justify-center">
                      <FaUser className="w-3 h-3 text-text-muted" />
                    </div>
                  )}
                  <span className="text-sm text-text-muted">{item.product.creator.name}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-text-muted mb-3">
                  <span>{item.product.category[0]?.name}</span>
                  <span>{item.product.download_count} downloads</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">
                    Added {formatDate(item.added_date)}
                  </span>
                  
                  <Link
                    href={`/product/${item.product.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded hover:bg-primary/80 transition-colors"
                  >
                    <FaShoppingCart className="w-3 h-3" />
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
