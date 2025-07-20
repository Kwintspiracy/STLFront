import { notFound } from 'next/navigation';
import { getAllCategories } from '@/lib/api/categories';
import { getProductsByCategory } from '@/lib/api/products';
import ProductsList from '@/components/product/ProductsList';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  try {
    // Récupérer toutes les catégories pour trouver celle qui correspond au slug
    const categories = await getAllCategories();
    const category = categories.find(cat => cat.slug === slug);

    if (!category) {
      notFound();
    }

    // Récupérer les produits de cette catégorie
    const products = await getProductsByCategory(slug);

    return (
      <div className="min-h-screen bg-primarybackground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header de la catégorie */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">
                {category.icon || '📦'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-gray-400 mt-2">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{products.length} modèles disponibles</span>
            </div>
          </div>

          {/* Grille des produits */}
          {products.length > 0 ? (
            <ProductsList products={products} />
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Aucun modèle disponible
              </h2>
              <p className="text-gray-400">
                {"Il n'y a actuellement aucun modèle dans cette catégorie."}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading category page:', error);
    notFound();
  }
}

// Générer les métadonnées pour le SEO
export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  
  try {
    const categories = await getAllCategories();
    const category = categories.find(cat => cat.slug === slug);
    
    if (!category) {
      return {
        title: 'Catégorie non trouvée',
      };
    }

    return {
      title: `${category.name} - STL Forge`,
      description: category.description || `Découvrez tous les modèles 3D de la catégorie ${category.name} sur STL Forge`,
    };
  } catch {
    return {
      title: 'Catégorie - STL Forge',
    };
  }
}

// Générer les routes statiques pour les catégories (optionnel, pour de meilleures performances)
export async function generateStaticParams() {
  try {
    const categories = await getAllCategories();
    return categories.map((category) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for categories:', error);
    return [];
  }
}
