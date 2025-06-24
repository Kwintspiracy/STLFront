import { Product } from "@/types/product";
import { mockProducts } from "@/data/mock-products";
import { API_BASE_URL, USE_MOCK_DATA } from "@/lib/api/config";

/**
 * Récupère tous les produits
 */
export async function getAllProducts(): Promise<Product[]> {
  if (USE_MOCK_DATA) {
    return mockProducts;
  }

  const res = await fetch(`${API_BASE_URL}/`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

/**
 * Récupère un produit par ID
 */
export async function getProductById(id: number): Promise<Product | undefined> {
  if (USE_MOCK_DATA) {
    return mockProducts.find((p) => p.id === id);
  }

  const res = await fetch(`${API_BASE_URL}/product/${id}`, { cache: "no-store" });
  if (!res.ok) return undefined;
  return res.json();
}


/**
 * Récupère les produits d'une catégorie
 */
export async function getProductsByCategory(categoryName: string): Promise<Product[]> {
  if (USE_MOCK_DATA) {
    return mockProducts.filter((p) =>
      p.category.some((cat) => cat.name.toLowerCase() === categoryName.toLowerCase())
    );
  }

  const res = await fetch(`http://127.0.0.1:8000/tag/${categoryName}`);
  if (!res.ok) throw new Error("Failed to fetch products by category");
  return res.json();
}