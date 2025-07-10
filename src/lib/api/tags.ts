import { Tag } from "@/types/product";
import { API_BASE_URL } from "./config";

const TAGS_ENDPOINTS = {
  LIST: `${API_BASE_URL}/products/tags/`,
};

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
