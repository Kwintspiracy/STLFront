'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Category } from '@/types/product';
import { getAllCategories } from '@/lib/api/categories';

interface CategoryGridProps {
  className?: string;
}

// Fonction pour obtenir un emoji par défaut basé sur le nom de la catégorie
function getDefaultIcon(categoryName: string): string {
  const name = categoryName.toLowerCase();
  if (name.includes('fantasy') || name.includes('fantaisie')) return '🧙‍♂️';
  if (name.includes('sci-fi') || name.includes('science')) return '🚀';
  if (name.includes('medieval') || name.includes('médiéval')) return '⚔️';
  if (name.includes('historic') || name.includes('historique') || name.includes('history')) return '🏰';
  if (name.includes('modern') || name.includes('moderne')) return '🏢';
  if (name.includes('vehicle') || name.includes('voiture') || name.includes('transport')) return '🚗';
  if (name.includes('animal') || name.includes('creature')) return '🦁';
  if (name.includes('architecture') || name.includes('building')) return '🏛️';
  if (name.includes('weapon') || name.includes('arme')) return '⚔️';
  if (name.includes('character') || name.includes('personnage')) return '👤';
  if (name.includes('miniature') || name.includes('figurine')) return '🎭';
  return '📦'; // Icône par défaut
}


export default function CategoryGrid({ className = "" }: CategoryGridProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Erreur lors du chargement des catégories');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className={`bg-cardbackground ${className}`} style={{ borderTopWidth: 'var(--border-width)', borderBottomWidth: 'var(--border-width)', borderColor: '#374151' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Browse by Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-primarybackground border border-gray-800 rounded-lg p-4 text-center animate-pulse">
                <div className="w-8 h-8 bg-gray-700 rounded mx-auto mb-2"></div>
                <div className="h-4 bg-gray-700 rounded mb-1"></div>
                <div className="h-3 bg-gray-700 rounded w-16 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-cardbackground ${className}`} style={{ borderTopWidth: 'var(--border-width)', borderBottomWidth: 'var(--border-width)', borderColor: '#374151' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Browse by Categories</h2>
          <div className="text-center text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className={`bg-cardbackground ${className}`} style={{ borderTopWidth: 'var(--border-width)', borderBottomWidth: 'var(--border-width)', borderColor: '#374151' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Browse by Categories</h2>
          <div className="text-center text-gray-400">Aucune catégorie disponible</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-cardbackground ${className}`} style={{ borderTopWidth: 'var(--border-width)', borderBottomWidth: 'var(--border-width)', borderColor: '#374151' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Browse by Categories</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {categories.map((category) => (
            <Link 
              key={category.id}
              href={`/category/${category.slug}`}
              className="bg-primarybackground border border-gray-800 rounded-lg p-4 text-center hover:border-primary transition-colors group"
            >
              <div className="text-3xl mb-2">
                {category.icon || getDefaultIcon(category.name)}
              </div>
              <div className="font-medium text-white group-hover:text-primary transition-colors">
                {category.name}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Explore category
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
