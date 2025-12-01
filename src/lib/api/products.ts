import { Product, hasCommercialLicense } from "@/types/product";
import { PRODUCT_ENDPOINTS } from "@/lib/api/config";
import { apiRequest } from "./httpClient";
import { getAccessToken } from "@/lib/utils/tokenService";

/**
 * Récupère tous les produits (endpoint public)
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    // Pour l'endpoint public, on utilise fetch directement (pas d'auth requise)
    const res = await fetch(PRODUCT_ENDPOINTS.LIST, {
      next: { revalidate: 21600 } // 6 hours - products change more frequently than categories
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    // L'API Django retourne une réponse paginée avec results
    return data.results || data;
  } catch {
    // Return empty array instead of mock data
    return [];
  }
}

/**
 * Récupère un produit par ID (endpoint public)
 */
export async function getProductById(id: number, options?: { skipCache?: boolean }): Promise<Product | undefined> {
  try {
    // For static generation, use fetch with shorter revalidation for product details
    // Skip cache for deletion operations to get real-time status
    const fetchOptions: RequestInit = options?.skipCache 
      ? { cache: 'no-store' }
      : { next: { revalidate: 1800 } }; // 30 minutes - for product details
    
    const res = await fetch(PRODUCT_ENDPOINTS.DETAIL(id), fetchOptions);
    
    if (!res.ok) {
      if (res.status === 404) {
        return undefined;
      }
      throw new Error(`Failed to fetch product: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    return data;
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('404')) {
      return undefined;
    }
    throw new Error(`Failed to fetch product: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Récupère un produit par ID avec authentification (pour accéder aux brouillons)
 */
export async function getProductByIdAuthenticated(id: number): Promise<Product | undefined> {
  try {
    const response = await apiRequest.get<Product>(PRODUCT_ENDPOINTS.DETAIL(id));
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as { response?: { status?: number }; message?: string };
    
    if (axiosError.response?.status === 404) {
      return undefined;
    }
    
    throw new Error(`Failed to fetch product: ${axiosError.message || 'Unknown error'}`);
  }
}

/**
 * Récupère les produits d'une catégorie
 */
export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  try {
    // Try different parameter formats that the API might expect
    const possibleEndpoints = [
      `${PRODUCT_ENDPOINTS.LIST}?category__slug=${categorySlug}`,
      `${PRODUCT_ENDPOINTS.LIST}?category_slug=${categorySlug}`,
      PRODUCT_ENDPOINTS.BY_CATEGORY(categorySlug), // Original format
    ];

    let lastError: Error | null = null;
    
    for (const endpoint of possibleEndpoints) {
      try {
        const res = await fetch(endpoint, {
          next: { revalidate: 86400 } // 24 hours - category product lists change when new products are added
        });
        
        if (res.ok) {
          const data = await res.json();
          // L'API Django retourne une réponse paginée avec results
          return data.results || data;
        } else if (res.status !== 400) {
          // If it's not a 400 error, throw immediately
          throw new Error(`Failed to fetch products by category: ${res.status} ${res.statusText}`);
        }
        // If it's a 400 error, try the next endpoint
      } catch (error) {
        lastError = error as Error;
        // Continue to next endpoint
      }
    }
    
    // If all endpoints failed, throw the last error
    throw lastError || new Error('All category endpoint formats failed');
    
  } catch {
    // Return empty array instead of mock data for graceful fallback
    return [];
  }
}

/**
 * Récupère les produits par tag
 */
export async function getProductsByTag(tagSlug: string): Promise<Product[]> {
  try {
    const res = await fetch(PRODUCT_ENDPOINTS.BY_TAG(tagSlug));
    if (!res.ok) {
      throw new Error(`Failed to fetch products by tag: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    // L'API Django retourne une réponse paginée avec results
    return data.results || data;
  } catch {
    // Return empty array instead of mock data
    return [];
  }
}

/**
 * Récupère les produits d'un studio
 */
export async function getProductsByStudio(studioId: number): Promise<Product[]> {
  try {
    // Always try with authentication first to get draft products
    const response = await apiRequest.get<{ results?: Product[] } | Product[]>(PRODUCT_ENDPOINTS.BY_STUDIO(studioId));
    // L'API Django retourne une réponse paginée avec results
    return Array.isArray(response.data) ? response.data : (response.data.results || []);
  } catch (error: unknown) {
    const axiosError = error as { response?: { status?: number }; message?: string };
    
    // If it's a 401, try without auth (public endpoint) - will only show published products
    if (axiosError.response?.status === 401) {
      try {
        const res = await fetch(PRODUCT_ENDPOINTS.BY_STUDIO(studioId));
        if (!res.ok) {
          throw new Error(`Failed to fetch products: ${res.status}`);
        }
        const data = await res.json();
        // L'API Django retourne une réponse paginée avec results
        return data.results || data;
      } catch {
        // Silent error handling
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
 * Supprime un produit et toutes ses ressources (nécessite l'authentification)
 */
export async function deleteProduct(id: number): Promise<void> {
  try {
    // 1. Essayer de récupérer le produit pour connaître ses ressources
    let product;
    try {
      product = await getProductById(id, { skipCache: true });
    } catch (error) {
      // Si le produit n'existe pas (404), on peut considérer qu'il est déjà "supprimé"
      if (error instanceof Error && (error.message.includes('404') || error.message.includes('not found'))) {
        return;
      }
      // Re-throw other errors
      throw error;
    }
    
    if (!product) {
      return;
    }

    // 2. Supprimer toutes les images
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        try {
          await deleteProductImage(id, image.id);
        } catch {
          // Continue with other images even if one fails
        }
      }
    }

    // 3. Supprimer tous les fichiers STL
    if (product.stl_files && product.stl_files.length > 0) {
      for (const stlFile of product.stl_files) {
        try {
          await deleteProductSTL(id, stlFile.id);
        } catch {
          // Continue with other files even if one fails
        }
      }
    }

    // 4. Supprimer le produit principal
    try {
      await apiRequest.delete(PRODUCT_ENDPOINTS.DETAIL(id));
    } catch (error) {
      // Si le produit principal n'existe pas non plus, c'est OK
      if (error instanceof Error && !error.message.includes('404')) {
        throw error;
      }
    }
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression du produit';
    throw new Error(errorMessage);
  }
}

/**
 * Upload une image pour un produit
 */
export async function uploadProductImage(productId: number, file: File, title: string, rank: number = 1): Promise<{ id: number; title: string; image: string; rank: number }> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('title', title);
  formData.append('rank', rank.toString());

  const response = await apiRequest.post<{ id: number; title: string; image: string; rank: number }>(
    PRODUCT_ENDPOINTS.UPLOAD_IMAGE(productId),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

/**
 * Upload un fichier STL pour un produit
 */
export async function uploadProductSTL(productId: number, file: File, title: string): Promise<{ id: number; title: string; file: string; size: number }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);

  const response = await apiRequest.post<{ id: number; title: string; file: string; size: number }>(
    PRODUCT_ENDPOINTS.UPLOAD_STL(productId),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

/**
 * Supprime une image d'un produit
 */
export async function deleteProductImage(productId: number, imageId: number): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const res = await fetch(`${PRODUCT_ENDPOINTS.DETAIL(productId)}/images/${imageId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to delete image: ${res.status} ${res.statusText}`);
  }
}

/**
 * Supprime un fichier STL d'un produit
 */
export async function deleteProductSTL(productId: number, stlId: number): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const res = await fetch(`${PRODUCT_ENDPOINTS.DETAIL(productId)}/stl-files/${stlId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to delete STL file: ${res.status} ${res.statusText}`);
  }
}

/**
 * Set an image as the main image (rank=1)
 */
export async function setMainProductImage(productId: number, imageId: number): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  // Remove trailing slash from DETAIL endpoint to avoid double slashes
  const baseUrl = PRODUCT_ENDPOINTS.DETAIL(productId).replace(/\/$/, '');
  const res = await fetch(`${baseUrl}/images/${imageId}/set-main/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to set main image: ${res.status} ${res.statusText}`);
  }
}

/**
 * Update the order of images for a product
 */
export async function updateImageOrder(productId: number, imageOrders: { id: number; rank: number }[]): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const baseUrl = PRODUCT_ENDPOINTS.DETAIL(productId).replace(/\/$/, '');
  const res = await fetch(`${baseUrl}/images/reorder/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ images: imageOrders }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update image order: ${res.status} ${res.statusText}`);
  }
}

// Helper functions pour la compatibilité avec l'ancien code

/**
 * Récupère les produits en vedette
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getAllProducts();
  // Pour l'instant, on prend les 5 premiers produits publiés
  return products
    .filter(p => p.status === 'published')
    .slice(0, 20);
}

/**
 * Récupère les produits tendance
 */
export async function getTrendingProducts(): Promise<Product[]> {
  const products = await getAllProducts();
  // Pour l'instant, on prend les produits 5 à 10
  return products
    .filter(p => p.status === 'published')
    .slice(0, 10);
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
  // Filtrer les produits avec une licence commerciale disponible
  return products
    .filter(p => 
      p.status === 'published' && 
      hasCommercialLicense(p)
    )
    .slice(0, 4);
}

/**
 * Récupère les produits avec des tags similaires
 */
export async function getProductsByTags(tags: { id: number; name: string }[], excludeProductId?: number): Promise<Product[]> {
  const products = await getAllProducts();
  
  if (!tags || tags.length === 0) {
    return [];
  }
  
  const tagNames = tags.map(tag => tag.name.toLowerCase());
  
  // Calculer le score de similarité pour chaque produit
  const productsWithScore = products
    .filter(p => 
      p.status === 'published' && 
      p.id !== excludeProductId && // Exclure le produit actuel
      p.tag && p.tag.length > 0
    )
    .map(product => {
      const productTagNames = product.tag.map(tag => tag.name.toLowerCase());
      const commonTags = productTagNames.filter(tagName => tagNames.includes(tagName));
      const score = commonTags.length;
      
      return {
        product,
        score,
        commonTags
      };
    })
    .filter(item => item.score > 0) // Garder seulement les produits avec au moins un tag en commun
    .sort((a, b) => b.score - a.score); // Trier par score décroissant
  
  return productsWithScore.map(item => item.product).slice(0, 8);
}
