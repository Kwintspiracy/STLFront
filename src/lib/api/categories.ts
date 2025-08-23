import { Category } from "@/types/product";
import { mockCategories } from "@/data/mock-categories"; // create this mock
import { API_BASE_URL } from "@/lib/api/config"; // optional shared config
import { getAllProducts } from "./products";

export async function getAllCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories/`, { 
      next: { revalidate: 3600 } // 1 hour - shorter cache for categories
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch categories: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    
    // L'API des catégories retourne directement un tableau
    if (Array.isArray(data)) {
      return data;
    }
    
    // Si c'est une structure paginée avec 'results'
    if (data && Array.isArray(data.results)) {
      return data.results;
    }
    
    console.warn("Unexpected API response format:", data);
    return [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    // Return empty array for graceful fallback during build
    return [];
  }
}

/**
 * Récupère les catégories avec le nombre de produits pour chacune
 */
export async function getCategoriesWithProductCount(): Promise<(Category & { productCount: number })[]> {
  try {
    const [categories, products] = await Promise.all([
      getAllCategories(),
      getAllProducts()
    ]);

    // Compter les produits par catégorie
    const categoryProductCounts = new Map<number, number>();
    
    products.forEach(product => {
      if (product.category && product.status === 'published') {
        const categoryId = product.category.id;
        categoryProductCounts.set(categoryId, (categoryProductCounts.get(categoryId) || 0) + 1);
      }
    });

    // Ajouter le nombre de produits à chaque catégorie et filtrer celles qui ont des produits
    return categories
      .map(category => ({
        ...category,
        productCount: categoryProductCounts.get(category.id) || 0
      }))
      .filter(category => category.productCount > 0) // Ne montrer que les catégories avec des produits
      .sort((a, b) => b.productCount - a.productCount); // Trier par nombre de produits décroissant
  } catch (error) {
    console.error("Error fetching categories with product count:", error);
    return [];
  }
}
