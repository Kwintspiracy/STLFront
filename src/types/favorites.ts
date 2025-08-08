// Types pour la gestion des favoris basés sur l'API officielle

// Interface pour les réponses paginées de l'API
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface FavoritePrimaryImage {
  url: string;
  title: string;
  width: number;
  height: number;
}

export interface FavoriteProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  studio_name: string;
  studio_slug: string;
  studio_id: number;
  primary_image: FavoritePrimaryImage | null;
}

export interface FavoriteItem {
  id: number;
  product: FavoriteProduct;
  created_at: string;
}

export interface AddFavoriteRequest {
  product_id: number;
}

export interface AddFavoriteResponse extends FavoriteItem {}

export interface CheckFavoriteResponse {
  product_id: number;
  is_favourited: boolean;
}

export interface FavoriteError {
  error?: string;
  detail?: string;
  product_id?: string[];
  [key: string]: any; // Pour capturer d'autres champs d'erreur possibles
}

// Types pour le contexte
export interface FavoritesState {
  favorites: Map<number, FavoriteItem>;
  loading: boolean;
  loadingProducts: Set<number>;
  error: string | null;
}

export interface FavoritesContextType {
  // État
  favorites: FavoriteItem[];
  loading: boolean;
  error: string | null;
  
  // Actions
  addToFavorites: (productId: number) => Promise<void>;
  removeFromFavorites: (productId: number) => Promise<void>;
  checkFavorite: (productId: number) => Promise<boolean>;
  loadFavorites: () => Promise<void>;
  
  // Utilitaires
  isFavorited: (productId: number) => boolean;
  isProductLoading: (productId: number) => boolean;
  getFavoriteCount: () => number;
  getFavoriteItem: (productId: number) => FavoriteItem | undefined;
}
