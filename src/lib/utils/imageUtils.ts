import { API_BASE_URL } from "@/lib/api/config";

/**
 * Construit une URL d'image complète et sécurisée
 * @param imageUrl - L'URL de l'image (peut être relative ou absolue)
 * @returns URL complète et sécurisée ou null si invalide
 */
export function buildImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return null;
  }

  // Nettoyer l'URL
  const cleanUrl = imageUrl.trim();
  
  if (!cleanUrl) {
    return null;
  }

  // Si c'est déjà une URL complète (http/https), la retourner telle quelle
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }

  // Si c'est une URL relative, construire l'URL complète
  if (cleanUrl.startsWith('/')) {
    return `${API_BASE_URL}${cleanUrl}`;
  }

  // Si ça ne commence pas par /, ajouter le slash
  return `${API_BASE_URL}/${cleanUrl}`;
}

/**
 * Obtient l'URL de l'image principale d'un produit
 * @param images - Tableau d'images du produit
 * @returns URL de l'image principale ou null
 */
export function getMainProductImageUrl(images: Array<{ url?: string; image?: string; rank: number }>): string | null {
  if (!images || images.length === 0) {
    return null;
  }

  // Trier par rang pour obtenir l'image principale
  const sortedImages = [...images].sort((a, b) => a.rank - b.rank);
  const mainImage = sortedImages[0];

  if (!mainImage) {
    return null;
  }

  // Essayer d'abord 'url', puis 'image'
  const imageUrl = mainImage.url || mainImage.image;
  return buildImageUrl(imageUrl);
}

/**
 * Valide si une URL d'image est sécurisée
 * @param url - L'URL à valider
 * @returns true si l'URL est sécurisée
 */
export function isSecureImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // Autoriser seulement HTTP/HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }

    // Bloquer les URLs suspectes
    const suspiciousPatterns = [
      'javascript:',
      'data:',
      'vbscript:',
      'file:',
      'ftp:'
    ];

    const lowerUrl = url.toLowerCase();
    return !suspiciousPatterns.some(pattern => lowerUrl.includes(pattern));
  } catch {
    return false;
  }
}

/**
 * Obtient une URL d'image sécurisée avec fallback
 * @param imageUrl - L'URL de l'image
 * @param fallbackUrl - URL de fallback (optionnelle)
 * @returns URL sécurisée ou fallback
 */
export function getSafeImageUrl(imageUrl: string | null | undefined, fallbackUrl?: string): string | null {
  const builtUrl = buildImageUrl(imageUrl);
  
  if (builtUrl && isSecureImageUrl(builtUrl)) {
    return builtUrl;
  }

  if (fallbackUrl && isSecureImageUrl(fallbackUrl)) {
    return fallbackUrl;
  }

  return null;
}
