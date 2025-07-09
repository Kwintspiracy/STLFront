'use client';

import Link from 'next/link';

interface Category {
  name: string;
  icon: string;
  count: string;
}

interface CategoryGridProps {
  categories?: Category[];
  className?: string;
}

const defaultCategories: Category[] = [
  { name: "Fantasy", icon: "🧙‍♂️", count: "2.1K" },
  { name: "Sci-Fi", icon: "🚀", count: "1.8K" },
  { name: "Medieval", icon: "⚔️", count: "1.5K" },
  { name: "Modern", icon: "🏢", count: "900" },
  { name: "Vehicles", icon: "🚗", count: "750" },
  { name: "Animals", icon: "🦁", count: "650" }
];

export default function CategoryGrid({ 
  categories = defaultCategories, 
  className = "" 
}: CategoryGridProps) {
  return (
    <div className={`bg-cardbackground border-y border-gray-800 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Browse by Tags</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link 
              key={category.name}
              href={`/category/${category.name.toLowerCase()}`}
              className="bg-primarybackground border border-gray-800 rounded-lg p-4 text-center hover:border-primary transition-colors group"
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <div className="font-medium text-white group-hover:text-primary transition-colors">
                {category.name}
              </div>
              <div className="text-xs text-gray-400 mt-1">{category.count} models</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
