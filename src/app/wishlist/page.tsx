'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  FaHeart, 
  FaHeartBroken,
  FaEye
} from 'react-icons/fa';
import { useFavorites } from '@/context/FavoritesContext';
import { FavoriteItem } from '@/types/favorites';
import ProductCard from '@/components/card/ProductCard';
import { Product } from '@/types/product';

export default function WishlistPage() {
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'price'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'free' | 'paid'>('all');
  
  // Utiliser le contexte des favoris
  const { favorites, loading } = useFavorites();

  const isFreeProduct = (price: string) => {
    return parseFloat(price) === 0;
  };

  // Convertir FavoriteItem vers Product pour le composant ProductCard
  const convertFavoriteToProduct = (item: FavoriteItem): Product => {
    return {
      id: item.product.id,
      name: item.product.name,
      description: '', // Non disponible dans FavoriteProduct
      price: item.product.price,
      professional_license_fee: '0.00', // Non disponible dans FavoriteProduct
      creator: {
        id: item.product.studio_id,
        name: item.product.studio_name,
        badge: undefined
      },
      status: 'published' as const,
      zip_size: '',
      zip_size_bytes: 0,
      created_at: item.created_at,
      updated_at: item.created_at,
      tag: [], // Non disponible dans FavoriteProduct
      images: item.product.primary_image ? [{
        id: 1,
        url: item.product.primary_image.url,
        image: item.product.primary_image.url,
        rank: 1,
        title: item.product.primary_image.title
      }] : [],
      stl_files: []
    };
  };

  const filteredAndSortedItems = favorites
    .filter((item: FavoriteItem) => {
      if (filterBy === 'free') return isFreeProduct(item.product.price);
      if (filterBy === 'paid') return !isFreeProduct(item.product.price);
      return true;
    })
    .sort((a: FavoriteItem, b: FavoriteItem) => {
      switch (sortBy) {
        case 'name':
          return a.product.name.localeCompare(b.product.name);
        case 'price':
          return parseFloat(a.product.price) - parseFloat(b.product.price);
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto text-white px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {[...Array(10)].map((_, i) => (
            <ProductCard key={i} product={{} as Product} loading={true} />
          ))}
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
            {favorites.length} item{favorites.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {/* Filters and Sort */}
        {favorites.length > 0 && (
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
            {favorites.length === 0 ? 'Your wishlist is empty' : 'No items match your filters'}
          </h2>
          <p className="text-gray-400 mb-6">
            {favorites.length === 0 
              ? 'Start exploring and add products you love to your wishlist!'
              : 'Try adjusting your filters to see more items.'
            }
          </p>
          {favorites.length === 0 && (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredAndSortedItems.map((item) => (
            <ProductCard
              key={item.id}
              product={convertFavoriteToProduct(item)}
              showFavorite={true}
            />
          ))}
        </div>
      )}
    </main>
  );
}
