import { Product, LegacyProduct, convertLegacyToProduct } from "@/types/product";
import { mockProducts } from "@/data/mock-products";
import { USE_MOCK_DATA, PRODUCT_ENDPOINTS, REAL_API_BASE_URL } from "@/lib/api/config";
import { apiRequest } from "./httpClient";

/**
 * Récupère tous les produits (endpoint public)
 */
export async function getAllProducts(): Promise<Product[]> {
  if (USE_MOCK_DATA) {
    // Convertir les mocks du format legacy vers le nouveau format
    return mockProducts.map(product => convertLegacyToProduct(product as any));
  }

  try {
    // Pour l'endpoint public, on utilise fetch directement (pas d'auth requise)
    const res = await fetch(PRODUCT_ENDPOINTS.LIST);
    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    // Return empty array instead of mock data
    return [];
  }
}

/**
 * Récupère un produit par ID (endpoint public)
 */
export async function getProductById(id: number): Promise<Product | undefined> {
  if (USE_MOCK_DATA) {
    const product = mockProducts.find((p) => p.id === id);
    return product ? convertLegacyToProduct(product as any) : undefined;
  }

  try {
    const response = await apiRequest.get<Product>(PRODUCT_ENDPOINTS.DETAIL(id));
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return undefined;
    }
    console.error("Error fetching product:", error);
    throw new Error(`Failed to fetch product: ${error.response?.status || error.message}`);
  }
}

/**
 * Récupère les produits d'une catégorie
 */
export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  if (USE_MOCK_DATA) {
    return mockProducts
      .filter((p) =>
        p.category.some((cat) => cat.name.toLowerCase() === categorySlug.toLowerCase())
      )
      .map(product => convertLegacyToProduct(product as any));
  }

  try {
    const res = await fetch(PRODUCT_ENDPOINTS.BY_CATEGORY(categorySlug));
    if (!res.ok) {
      throw new Error(`Failed to fetch products by category: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching products by category:", error);
    // Return empty array instead of mock data
    return [];
  }
}

/**
 * Récupère les produits par tag
 */
export async function getProductsByTag(tagSlug: string): Promise<Product[]> {
  if (USE_MOCK_DATA) {
    return mockProducts
      .filter((p) =>
        p.tag.some((tag) => tag.name.toLowerCase() === tagSlug.toLowerCase())
      )
      .map(product => convertLegacyToProduct(product as any));
  }

  try {
    const res = await fetch(PRODUCT_ENDPOINTS.BY_TAG(tagSlug));
    if (!res.ok) {
      throw new Error(`Failed to fetch products by tag: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching products by tag:", error);
    // Return empty array instead of mock data
    return [];
  }
}

/**
 * Récupère les produits d'un studio
 */
export async function getProductsByStudio(studioId: number): Promise<Product[]> {
  if (USE_MOCK_DATA) {
    return mockProducts
      .filter((p) => p.creator.id === studioId)
      .map(product => convertLegacyToProduct(product as any));
  }

  try {
    // Use apiRequest for authenticated endpoint
    const response = await apiRequest.get<Product[]>(PRODUCT_ENDPOINTS.BY_STUDIO(studioId));
    return response.data;
  } catch (error: any) {
    console.error("Error fetching products by studio:", error);
    
    // If it's a 401, try without auth (public endpoint)
    if (error.response?.status === 401) {
      try {
        const res = await fetch(PRODUCT_ENDPOINTS.BY_STUDIO(studioId));
        if (!res.ok) {
          throw new Error(`Failed to fetch products: ${res.status}`);
        }
        const data = await res.json();
        return data;
      } catch (publicError) {
        console.error("Error fetching products (public):", publicError);
      }
    }
    
    // Return empty array instead of mock data
    return [];
  }
}

/**
 * Crée un nouveau produit (nécessite l'authentification)
 */
export async function createProduct(productData: Partial<Product>): Promise<Product> {
  const response = await apiRequest.post<Product>(PRODUCT_ENDPOINTS.CREATE, productData);
  return response.data;
}

/**
 * Met à jour un produit (nécessite l'authentification)
 */
export async function updateProduct(id: number, productData: Partial<Product>): Promise<Product> {
  const response = await apiRequest.patch<Product>(PRODUCT_ENDPOINTS.UPDATE(id), productData);
  return response.data;
}

/**
 * Supprime un produit (nécessite l'authentification)
 */
export async function deleteProduct(id: number): Promise<void> {
  // Since the API doesn't seem to support deletion, we'll mark it as draft
  // and add a prefix to indicate it's been "deleted"
  try {
    const product = await getProductById(id);
    if (product) {
      await updateProduct(id, { 
        status: 'draft',
        name: `[SUPPRIMÉ] ${product.name}`
      });
      console.log('Product marked as deleted (draft status with [SUPPRIMÉ] prefix)');
    }
  } catch (error: any) {
    console.error('Error in deleteProduct:', error);
    throw new Error('Impossible de supprimer le produit. L\'API ne supporte pas la suppression directe.');
  }
}

/**
 * Upload une image pour un produit
 */
export async function uploadProductImage(productId: number, file: File, title: string, rank: number = 1): Promise<any> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('title', title);
  formData.append('rank', rank.toString());

  // Try different endpoint patterns
  try {
    const response = await apiRequest.post(
      `/product/products/${productId}/images/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      // Try alternative endpoint
      const response = await apiRequest.post(
        `/product/images/`,
        {
          ...formData,
          product: productId
        },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    }
    throw error;
  }
}

/**
 * Upload un fichier STL pour un produit
 */
export async function uploadProductSTL(productId: number, file: File, title: string): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);

  // Try different endpoint patterns
  try {
    const response = await apiRequest.post(
      `/product/products/${productId}/stl-files/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      // Try alternative endpoint
      const response = await apiRequest.post(
        `/product/stl-files/`,
        {
          ...formData,
          product: productId
        },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    }
    throw error;
  }
}

/**
 * Supprime une image d'un produit
 */
export async function deleteProductImage(productId: number, imageId: number): Promise<void> {
  await apiRequest.delete(`${REAL_API_BASE_URL}/product/products/${productId}/images/${imageId}/`);
}

/**
 * Supprime un fichier STL d'un produit
 */
export async function deleteProductSTL(productId: number, stlId: number): Promise<void> {
  await apiRequest.delete(`${REAL_API_BASE_URL}/product/products/${productId}/stl-files/${stlId}/`);
}

// Helper functions pour la compatibilité avec l'ancien code

/**
 * Récupère les produits en vedette
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getAllProducts();
  // Pour l'instant, on prend les 4 premiers produits publiés
  return products
    .filter(p => p.status === 'published')
    .slice(0, 4);
}

/**
 * Récupère les produits tendance
 */
export async function getTrendingProducts(): Promise<Product[]> {
  const products = await getAllProducts();
  // Pour l'instant, on prend les produits 5 à 9
  return products
    .filter(p => p.status === 'published')
    .slice(4, 9);
}

/**
 * Récupère les derniers produits
 */
export async function getLatestProducts(): Promise<Product[]> {
  const products = await getAllProducts();
  // Trier par date de création décroissante et prendre les 8 premiers
  return products
    .filter(p => p.status === 'published')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);
}

/**
 * Récupère les produits avec licence commerciale
 */
export async function getCommercialProducts(): Promise<Product[]> {
  const products = await getAllProducts();
  // Filtrer les produits avec une licence commerciale > 0
  return products
    .filter(p => p.status === 'published' && parseFloat(p.professional_license_fee) > 0)
    .slice(0, 4);
}
