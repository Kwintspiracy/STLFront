// Service API pour la gestion des favoris
import { 
  FavoriteItem, 
  AddFavoriteRequest, 
  AddFavoriteResponse, 
  CheckFavoriteResponse,
  FavoriteError,
  PaginatedResponse
} from '@/types/favorites';
import { FAVORITES_ENDPOINTS } from './config';
import { getAccessToken } from '@/lib/utils/tokenService';

// Fonction utilitaire pour gérer les erreurs API
const handleFavoriteError = (error: any): never => {
  console.error('API Error details:', error);
  
  if (error.response?.status === 401) {
    throw new Error('Authentication required. Please log in.');
  }
  
  if (error.response?.status === 400) {
    const data = error.response.data;
    console.error('400 Error data:', data);
    
    // Si c'est un tableau (comme ["Product is already favourited."])
    if (Array.isArray(data) && data.length > 0) {
      const message = data[0];
      if (message.includes('already favourited')) {
        throw new Error('Product is already in favorites.');
      }
      throw new Error(message);
    }
    
    // Si c'est un objet avec des champs spécifiques
    if (data && typeof data === 'object') {
      const errorData = data as FavoriteError;
      if (errorData.product_id) {
        throw new Error(errorData.product_id[0] || 'Invalid product.');
      }
      if (errorData.error) {
        throw new Error(errorData.error);
      }
      if (errorData.detail) {
        throw new Error(errorData.detail);
      }
    }
    
    throw new Error(`Bad request: ${JSON.stringify(data)}`);
  }
  
  if (error.response?.status === 404) {
    const data = error.response.data as FavoriteError;
    throw new Error(data.error || 'Product not found or not available.');
  }
  
  if (error.response?.status === 409) {
    const data = error.response.data as FavoriteError;
    throw new Error(data.error || 'Product is already in favorites.');
  }
  
  // Erreur générique
  throw new Error(error.message || 'An unexpected error occurred.');
};

// Fonction utilitaire pour faire les requêtes avec authentification
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  // Récupérer le token depuis le tokenService (cookies)
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = {
      response: {
        status: response.status,
        data: await response.json().catch(() => ({}))
      }
    };
    handleFavoriteError(error);
  }
  
  // Pour les DELETE requests, pas de contenu à retourner
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};

/**
 * Récupère la liste de tous les favoris de l'utilisateur
 */
export const getFavorites = async (): Promise<FavoriteItem[]> => {
  try {
    const data = await makeAuthenticatedRequest(FAVORITES_ENDPOINTS.LIST);
    
    // Gérer la structure paginée de l'API
    if (data && typeof data === 'object' && 'results' in data) {
      const paginatedData = data as PaginatedResponse<FavoriteItem>;
      return Array.isArray(paginatedData.results) ? paginatedData.results : [];
    }
    
    // Fallback pour compatibilité si l'API retourne directement un tableau
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
};

/**
 * Ajoute un produit aux favoris
 */
export const addToFavorites = async (productId: number): Promise<AddFavoriteResponse> => {
  try {
    const requestBody: AddFavoriteRequest = { product_id: productId };
    
    const data = await makeAuthenticatedRequest(FAVORITES_ENDPOINTS.ADD, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    
    return data as AddFavoriteResponse;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

/**
 * Supprime un produit des favoris
 */
export const removeFromFavorites = async (productId: number): Promise<void> => {
  try {
    await makeAuthenticatedRequest(FAVORITES_ENDPOINTS.REMOVE(productId), {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

/**
 * Vérifie si un produit est dans les favoris
 */
export const checkFavorite = async (productId: number): Promise<boolean> => {
  try {
    const data = await makeAuthenticatedRequest(FAVORITES_ENDPOINTS.CHECK(productId));
    const response = data as CheckFavoriteResponse;
    return response.is_favourited;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    // Si le produit n'existe pas ou n'est pas disponible, on considère qu'il n'est pas favorisé
    if (error instanceof Error && error.message.includes('not found')) {
      return false;
    }
    throw error;
  }
};

/**
 * Bascule le statut favori d'un produit (utilitaire)
 */
export const toggleFavorite = async (productId: number, currentlyFavorited: boolean): Promise<FavoriteItem | null> => {
  try {
    if (currentlyFavorited) {
      await removeFromFavorites(productId);
      return null;
    } else {
      return await addToFavorites(productId);
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};

// Export par défaut pour faciliter l'import
export default {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavorite,
  toggleFavorite,
};
