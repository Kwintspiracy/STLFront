import { Tag } from "@/types/product";
import { API_BASE_URL } from "./config";

const TAGS_ENDPOINTS = {
  LIST: `${API_BASE_URL}/products/tags/`,
  SEARCH: `${API_BASE_URL}/products/tags/search/`,
  VALIDATE: `${API_BASE_URL}/products/tags/validate/`,
  CREATE: `${API_BASE_URL}/products/tags/create/`,
  SUGGEST_CORRECTIONS: `${API_BASE_URL}/products/tags/suggest-corrections/`,
  VALIDATE_LIMIT: `${API_BASE_URL}/products/tags/validate-limit/`,
  POPULAR: `${API_BASE_URL}/products/tags/popular/`,
};

export interface TagValidationResult {
  is_valid: boolean;
  normalized_name: string;
  errors: string[];
  warnings: string[];
  suggestions: Array<{
    type: 'existing' | 'correction';
    tag_name: string;
    tag_id: number;
    confidence?: number;
    tag_data?: Tag;
  }>;
}

export interface TagSearchResult {
  results: Tag[];
  query: string;
  count: number;
}

export interface TagCorrection {
  original: string;
  suggestion: string;
  confidence: number;
  tag: Tag;
}

export interface TagLimitValidation {
  is_valid: boolean;
  current_count: number;
  max_allowed: number;
  error?: string;
}

/**
 * Récupère tous les tags disponibles
 */
export async function getAllTags(): Promise<Tag[]> {
  try {
    const res = await fetch(TAGS_ENDPOINTS.LIST);
    if (!res.ok) {
      throw new Error(`Failed to fetch tags: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    // L'API Django retourne une réponse paginée avec results
    return data.results || data;
  } catch (error) {
    console.error("Error fetching tags:", error);
    // Return empty array instead of throwing
    return [];
  }
}

/**
 * Recherche des tags avec autocomplétion
 */
export async function searchTags(query: string, limit: number = 10): Promise<TagSearchResult> {
  try {
    const res = await fetch(TAGS_ENDPOINTS.SEARCH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, limit }),
    });

    if (!res.ok) {
      throw new Error(`Failed to search tags: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error searching tags:", error);
    return { results: [], query, count: 0 };
  }
}

/**
 * Valide un nom de tag et retourne des suggestions
 */
export async function validateTag(name: string): Promise<TagValidationResult> {
  try {
    const res = await fetch(TAGS_ENDPOINTS.VALIDATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      throw new Error(`Failed to validate tag: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error validating tag:", error);
    throw error;
  }
}

/**
 * Crée un nouveau tag
 */
export async function createTag(name: string): Promise<{ tag: Tag; created: boolean; message: string }> {
  try {
    const { getAccessToken } = await import('@/lib/utils/tokenService');
    const token = getAccessToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const res = await fetch(TAGS_ENDPOINTS.CREATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || `Failed to create tag: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error creating tag:", error);
    throw error;
  }
}

/**
 * Suggère des corrections pour un tag mal orthographié
 */
export async function suggestCorrections(name: string): Promise<{ original: string; corrections: TagCorrection[]; count: number }> {
  try {
    const res = await fetch(TAGS_ENDPOINTS.SUGGEST_CORRECTIONS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      throw new Error(`Failed to get suggestions: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error getting suggestions:", error);
    return { original: name, corrections: [], count: 0 };
  }
}

/**
 * Valide que le nombre de tags ne dépasse pas la limite
 */
export async function validateTagLimit(currentTags: number[], newTags: number[]): Promise<TagLimitValidation> {
  try {
    const res = await fetch(TAGS_ENDPOINTS.VALIDATE_LIMIT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ current_tags: currentTags, new_tags: newTags }),
    });

    if (!res.ok) {
      throw new Error(`Failed to validate tag limit: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error validating tag limit:", error);
    return {
      is_valid: false,
      current_count: currentTags.length + newTags.length,
      max_allowed: 5,
      error: "Erreur lors de la validation"
    };
  }
}

/**
 * Récupère les tags les plus populaires
 */
export async function getPopularTags(limit: number = 20): Promise<TagSearchResult> {
  try {
    const res = await fetch(`${TAGS_ENDPOINTS.POPULAR}?limit=${limit}`);

    if (!res.ok) {
      throw new Error(`Failed to fetch popular tags: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return {
      results: data.results || [],
      query: '',
      count: data.count || 0
    };
  } catch (error) {
    console.error("Error fetching popular tags:", error);
    return { results: [], query: '', count: 0 };
  }
}
