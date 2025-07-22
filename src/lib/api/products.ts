import { Product, LegacyProduct, convertLegacyToProduct } from "@/types/product";
import { mockProducts } from "@/data/mock-products";
import { USE_MOCK_DATA, PRODUCT_ENDPOINTS } from "@/lib/api/config";
import { apiRequest } from "./httpClient";
import { getAccessToken } from "@/lib/utils/tokenService";

/**
 * Récupère tous les produits (endpoint public)
 */
export async function getAllProducts(): Promise<Product[]> {
  if (USE_MOCK_DATA) {
    // Convertir les mocks du format legacy vers le nouveau format
    return mockProducts.map(product => convertLegacyToProduct(product as LegacyProduct));
  }

  try {
    // Pour l'endpoint public, on utilise fetch directement (pas d'auth requise)
    const res = await fetch(PRODUCT_ENDPOINTS.LIST);
    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    // L'API Django retourne une réponse paginée avec results
    return data.results || data;
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
    return product ? convertLegacyToProduct(product as LegacyProduct) : undefined;
  }

  try {
    const response = await apiRequest.get<Product>(PRODUCT_ENDPOINTS.DETAIL(id));
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        return undefined;
      }
      console.error("Error fetching product:", error);
      throw new Error(`Failed to fetch product: ${axiosError.response?.status || 'Unknown error'}`);
    }
    console.error("Error fetching product:", error);
    throw new Error(`Failed to fetch product: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      .map(product => convertLegacyToProduct(product as LegacyProduct));
  }

  try {
    const res = await fetch(PRODUCT_ENDPOINTS.BY_CATEGORY(categorySlug));
    if (!res.ok) {
      throw new Error(`Failed to fetch products by category: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    // L'API Django retourne une réponse paginée avec results
    return data.results || data;
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
      .map(product => convertLegacyToProduct(product as LegacyProduct));
  }

  try {
    const res = await fetch(PRODUCT_ENDPOINTS.BY_TAG(tagSlug));
    if (!res.ok) {
      throw new Error(`Failed to fetch products by tag: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    // L'API Django retourne une réponse paginée avec results
    return data.results || data;
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
      .map(product => convertLegacyToProduct(product as LegacyProduct));
  }

  console.log(`🏢 Fetching products for studio ${studioId}...`);

  try {
    // Always try with authentication first to get draft products
    const response = await apiRequest.get<{ results?: Product[] } | Product[]>(PRODUCT_ENDPOINTS.BY_STUDIO(studioId));
    console.log(`✅ Authenticated request successful: ${Array.isArray(response.data) ? response.data.length : response.data.results?.length || 0} products`);
    // L'API Django retourne une réponse paginée avec results
    return Array.isArray(response.data) ? response.data : (response.data.results || []);
  } catch (error: unknown) {
    const axiosError = error as { response?: { status?: number }; message?: string };
    console.log(`❌ Authenticated request failed:`, axiosError.response?.status, axiosError.message);
    
    // If it's a 401, try without auth (public endpoint) - will only show published products
    if (axiosError.response?.status === 401) {
      try {
        console.log(`🔓 Trying public endpoint...`);
        const res = await fetch(PRODUCT_ENDPOINTS.BY_STUDIO(studioId));
        if (!res.ok) {
          throw new Error(`Failed to fetch products: ${res.status}`);
        }
        const data = await res.json();
        console.log(`✅ Public request successful: ${data.results?.length || data.length || 0} products (published only)`);
        // L'API Django retourne une réponse paginée avec results
        return data.results || data;
      } catch (publicError) {
        console.error("Error fetching products (public):", publicError);
      }
    }
    
    // Return empty array instead of mock data
    return [];
  }
}

/**
 * Helper function to delay execution
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if error is a network/connection error that should be retried
 */
const isRetryableError = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { 
      response?: { status?: number };
      code?: string;
      message?: string;
    };
    
    // Retry on network errors, timeouts, and 500 errors
    return (
      !axiosError.response || // Network error (no response)
      (axiosError.response.status !== undefined && axiosError.response.status >= 500) || // Server errors
      axiosError.code === 'ECONNABORTED' || // Timeout
      axiosError.code === 'ERR_NETWORK' || // Network error
      axiosError.code === 'ERR_BAD_RESPONSE' || // Bad response (like stream error)
      (axiosError.message?.includes('stream error') ?? false) || // Stream errors
      (axiosError.message?.includes('connection') ?? false) // Connection errors
    );
  }
  return false;
};

/**
 * Crée un nouveau produit (nécessite l'authentification)
 */
export async function createProduct(productData: Partial<Product>): Promise<Product> {
  console.log('🚀 Creating product with data:', JSON.stringify(productData, null, 2));
  console.log('📡 Endpoint URL:', PRODUCT_ENDPOINTS.CREATE);
  console.log('🔑 Token available:', !!getAccessToken());
  
  const maxRetries = 3;
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries}`);
      
      const response = await apiRequest.post<Product>(PRODUCT_ENDPOINTS.CREATE, productData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('✅ Raw response:', response);
      console.log('✅ Response data:', response.data);
      console.log('✅ Product ID from response:', response.data?.id);
      
      return response.data;
      
    } catch (error: unknown) {
      lastError = error;
      console.error(`❌ Attempt ${attempt} failed:`, error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            status?: number; 
            data?: unknown;
            statusText?: string;
          };
          message?: string;
          code?: string;
        };
        
        console.error('❌ Error status:', axiosError.response?.status);
        console.error('❌ Error statusText:', axiosError.response?.statusText);
        console.error('❌ Error code:', axiosError.code);
        console.error('❌ Error message:', axiosError.message);
        
        // Don't retry on client errors (4xx) except 408 (timeout)
        if (axiosError.response?.status && 
            axiosError.response.status >= 400 && 
            axiosError.response.status < 500 && 
            axiosError.response.status !== 408) {
          console.error('❌ Client error - not retrying');
          break;
        }
      }
      
      // Check if we should retry
      if (attempt < maxRetries && isRetryableError(error)) {
        const delayMs = 1000 * attempt; // 1s, 2s, 3s
        console.log(`⏳ Retrying in ${delayMs}ms...`);
        await delay(delayMs);
        continue;
      }
      
      // Last attempt or non-retryable error
      break;
    }
  }
  
  console.error('❌ All retry attempts failed');
  throw lastError;
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
  console.log(`🗑️ Deleting product ${id}...`);
  
  try {
    await apiRequest.delete(PRODUCT_ENDPOINTS.DELETE(id));
    console.log('✅ Product deleted successfully from database');
  } catch (error: unknown) {
    console.error('❌ Error deleting product:', error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: unknown } };
      
      if (axiosError.response?.status === 404) {
        console.log('⚠️ Product not found, may already be deleted');
        return; // Consider it successful if already deleted
      }
      
      if (axiosError.response?.status === 403) {
        throw new Error('Vous n\'avez pas les permissions pour supprimer ce produit');
      }
      
      if (axiosError.response?.data && typeof axiosError.response.data === 'object' && 'error' in axiosError.response.data) {
        throw new Error(String(axiosError.response.data.error));
      }
    }
    
    throw new Error('Erreur lors de la suppression du produit. Veuillez réessayer.');
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
    const errorMessage = (errorData && typeof errorData === 'object' && 'error' in errorData) 
      ? String(errorData.error) 
      : `Failed to delete image: ${res.status} ${res.statusText}`;
    throw new Error(errorMessage);
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
    const errorMessage = (errorData && typeof errorData === 'object' && 'error' in errorData) 
      ? String(errorData.error) 
      : `Failed to delete STL file: ${res.status} ${res.statusText}`;
    throw new Error(errorMessage);
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
    const errorMessage = (errorData && typeof errorData === 'object' && 'error' in errorData) 
      ? String(errorData.error) 
      : `Failed to set main image: ${res.status} ${res.statusText}`;
    throw new Error(errorMessage);
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
    const errorMessage = (errorData && typeof errorData === 'object' && 'error' in errorData) 
      ? String(errorData.error) 
      : `Failed to update image order: ${res.status} ${res.statusText}`;
    throw new Error(errorMessage);
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
  // Filtrer les produits avec une licence commerciale disponible (non null) et > 0
  return products
    .filter(p => 
      p.status === 'published' && 
      p.professional_license_fee !== null && 
      p.professional_license_fee !== undefined &&
      parseFloat(p.professional_license_fee) > 0
    )
    .slice(0, 4);
}
