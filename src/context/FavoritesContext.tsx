'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { FavoriteItem, FavoritesState, FavoritesContextType } from '@/types/favorites';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import * as favoritesService from '@/lib/api/favoritesService';

// Actions pour le reducer
type FavoritesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FAVORITES'; payload: FavoriteItem[] }
  | { type: 'ADD_FAVORITE'; payload: FavoriteItem }
  | { type: 'REMOVE_FAVORITE'; payload: number }
  | { type: 'SET_PRODUCT_LOADING'; payload: { productId: number; loading: boolean } }
  | { type: 'CLEAR_FAVORITES' };

// État initial
const initialState: FavoritesState = {
  favorites: new Map(),
  loading: false,
  loadingProducts: new Set(),
  error: null,
};

// Reducer pour gérer l'état des favoris
const favoritesReducer = (state: FavoritesState, action: FavoritesAction): FavoritesState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_FAVORITES':
      const favoritesMap = new Map<number, FavoriteItem>();
      // S'assurer que payload est un tableau
      const favoritesArray = Array.isArray(action.payload) ? action.payload : [];
      favoritesArray.forEach(favorite => {
        favoritesMap.set(favorite.product.id, favorite);
      });
      return { ...state, favorites: favoritesMap, loading: false, error: null };
    
    case 'ADD_FAVORITE':
      const newFavorites = new Map(state.favorites);
      newFavorites.set(action.payload.product.id, action.payload);
      return { ...state, favorites: newFavorites };
    
    case 'REMOVE_FAVORITE':
      const updatedFavorites = new Map(state.favorites);
      updatedFavorites.delete(action.payload);
      return { ...state, favorites: updatedFavorites };
    
    case 'SET_PRODUCT_LOADING':
      const newLoadingProducts = new Set(state.loadingProducts);
      if (action.payload.loading) {
        newLoadingProducts.add(action.payload.productId);
      } else {
        newLoadingProducts.delete(action.payload.productId);
      }
      return { ...state, loadingProducts: newLoadingProducts };
    
    case 'CLEAR_FAVORITES':
      return { ...initialState };
    
    default:
      return state;
  }
};

// Création du contexte
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Provider des favoris
export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  // Charger les favoris au login
  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      dispatch({ type: 'CLEAR_FAVORITES' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const favorites = await favoritesService.getFavorites();
      dispatch({ type: 'SET_FAVORITES', payload: favorites });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load favorites';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Error loading favorites:', error);
    }
  }, [isAuthenticated]);

  // Charger les favoris quand l'utilisateur se connecte
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Ajouter aux favoris avec vérification serveur et mise à jour optimiste
  const addToFavorites = useCallback(async (productId: number) => {
    if (!isAuthenticated) {
      showToast('Please log in to add favorites', 'error');
      return;
    }

    // Éviter les doubles clics
    if (state.loadingProducts.has(productId)) {
      return;
    }

    // Si le produit est déjà en favoris localement, ne rien faire
    if (state.favorites.has(productId)) {
      showToast('Product is already in favorites', 'info');
      return;
    }

    dispatch({ type: 'SET_PRODUCT_LOADING', payload: { productId, loading: true } });

    try {
      // Vérifier l'état réel côté serveur avant d'ajouter
      const serverStatus = await favoritesService.checkFavorite(productId);
      
      if (serverStatus) {
        // Désynchronisation détectée : le serveur dit que c'est en favoris mais pas localement
        console.warn(`Desynchronization detected for product ${productId}: server has it, local cache doesn't`);
        showToast('Synchronizing favorites...', 'info');
        
        // Récupérer les favoris directement depuis l'API et mettre à jour l'état
        try {
          const freshFavorites = await favoritesService.getFavorites();
          console.log(`Synced favorites for product ${productId}:`, freshFavorites.map(f => f.product.id));
          dispatch({ type: 'SET_FAVORITES', payload: freshFavorites });
          
          // Vérifier si le produit est maintenant dans les favoris synchronisés
          const productInFavorites = freshFavorites.some(fav => fav.product.id === productId);
          
          if (productInFavorites) {
            showToast('Product is already in favorites', 'info');
          } else {
            // Incohérence API détectée : CHECK dit oui, LIST ne le contient pas
            console.error(`API inconsistency for product ${productId}: CHECK=true, LIST=false`);
            console.log('Available favorites:', freshFavorites.map(f => f.product.id));
            
            // Essayer de forcer l'ajout malgré l'incohérence
            showToast('Detected API inconsistency, attempting to add...', 'warning');
            
            try {
              const favoriteItem = await favoritesService.addToFavorites(productId);
              dispatch({ type: 'ADD_FAVORITE', payload: favoriteItem });
              showToast('Successfully added to favorites', 'success');
            } catch (addError) {
              const addErrorMessage = addError instanceof Error ? addError.message : 'Failed to add';
              if (addErrorMessage.includes('already')) {
                // Le serveur dit encore que c'est déjà en favoris
                showToast('Product is in favorites (server inconsistency)', 'info');
              } else {
                showToast(`Failed to add: ${addErrorMessage}`, 'error');
              }
            }
          }
        } catch (syncError) {
          console.error('Failed to sync favorites:', syncError);
          showToast('Failed to synchronize favorites', 'error');
        }
        return;
      }

      // Le serveur confirme que ce n'est pas en favoris, procéder à l'ajout
      const favoriteItem = await favoritesService.addToFavorites(productId);
      dispatch({ type: 'ADD_FAVORITE', payload: favoriteItem });
      showToast('Added to favorites', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add to favorites';
      
      // Si le produit est déjà en favoris selon le serveur
      if (errorMessage.includes('already')) {
        console.warn(`Server says product ${productId} is already in favorites, but local cache disagrees`);
        showToast('Synchronizing favorites...', 'info');
        // Recharger les favoris pour synchroniser l'état local avec le serveur
        await loadFavorites();
        showToast('Product is already in favorites', 'info');
      } else {
        showToast(errorMessage, 'error');
      }
    } finally {
      dispatch({ type: 'SET_PRODUCT_LOADING', payload: { productId, loading: false } });
    }
  }, [isAuthenticated, state.loadingProducts, state.favorites, showToast, loadFavorites]);

  // Supprimer des favoris avec mise à jour optimiste
  const removeFromFavorites = useCallback(async (productId: number) => {
    if (!isAuthenticated) {
      showToast('Please log in to manage favorites', 'error');
      return;
    }

    // Éviter les doubles clics
    if (state.loadingProducts.has(productId)) {
      return;
    }

    // Sauvegarder l'état actuel pour le rollback
    const wasInFavorites = state.favorites.has(productId);
    const originalFavorite = state.favorites.get(productId);

    if (!wasInFavorites) {
      showToast('Product is not in favorites', 'info');
      return;
    }

    // Mise à jour optimiste
    dispatch({ type: 'REMOVE_FAVORITE', payload: productId });
    dispatch({ type: 'SET_PRODUCT_LOADING', payload: { productId, loading: true } });

    try {
      await favoritesService.removeFromFavorites(productId);
      showToast('Removed from favorites', 'success');
      
      // Optionnel : Resynchroniser après suppression pour éviter les désynchronisations futures
      // Ceci est fait de manière asynchrone pour ne pas ralentir l'UX
      setTimeout(() => {
        loadFavorites().catch(error => {
          console.warn('Failed to resync favorites after removal:', error);
        });
      }, 1000); // Délai de 1 seconde pour laisser le serveur se mettre à jour
      
    } catch (error) {
      // Rollback en cas d'erreur
      if (originalFavorite) {
        dispatch({ type: 'ADD_FAVORITE', payload: originalFavorite });
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove from favorites';
      showToast(errorMessage, 'error');
    } finally {
      dispatch({ type: 'SET_PRODUCT_LOADING', payload: { productId, loading: false } });
    }
  }, [isAuthenticated, state.loadingProducts, state.favorites, showToast]);

  // Vérifier si un produit est en favoris
  const checkFavorite = useCallback(async (productId: number): Promise<boolean> => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      return await favoritesService.checkFavorite(productId);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }, [isAuthenticated]);

  // Utilitaires
  const isFavorited = useCallback((productId: number): boolean => {
    return state.favorites.has(productId);
  }, [state.favorites]);

  const isProductLoading = useCallback((productId: number): boolean => {
    return state.loadingProducts.has(productId);
  }, [state.loadingProducts]);

  const getFavoriteCount = useCallback((): number => {
    return state.favorites.size;
  }, [state.favorites]);

  const getFavoriteItem = useCallback((productId: number): FavoriteItem | undefined => {
    return state.favorites.get(productId);
  }, [state.favorites]);

  // Convertir la Map en Array pour l'interface
  const favoritesArray = Array.from(state.favorites.values());

  const contextValue: FavoritesContextType = {
    // État
    favorites: favoritesArray,
    loading: state.loading,
    error: state.error,
    
    // Actions
    addToFavorites,
    removeFromFavorites,
    checkFavorite,
    loadFavorites,
    
    // Utilitaires
    isFavorited,
    isProductLoading,
    getFavoriteCount,
    getFavoriteItem,
  };

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Hook pour utiliser le contexte des favoris
export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

// Export par défaut
export default FavoritesContext;
