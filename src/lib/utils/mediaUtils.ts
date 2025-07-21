/**
 * Media URL utilities for handling different environments
 */

/**
 * Get the appropriate media URL based on environment and configuration
 * @param path - The media path (e.g., "/studios/1/banner.jpg")
 * @returns Complete URL for the media
 */
export function getMediaUrl(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In production or when using external storage, use the production path
  const useProductionPath = process.env.NODE_ENV === 'production' || 
                           process.env.NEXT_PUBLIC_USE_EXTERNAL_STORAGE === 'true';
  
  if (useProductionPath && process.env.NEXT_PUBLIC_MEDIA_PATH_PROD) {
    return `${process.env.NEXT_PUBLIC_MEDIA_PATH_PROD}/${cleanPath}`;
  }
  
  // Default to local media path
  const basePath = process.env.NEXT_PUBLIC_MEDIA_PATH || '/media';
  return `${basePath}/${cleanPath}`;
}

/**
 * Check if a URL is an external URL (starts with http/https)
 * @param url - URL to check
 * @returns true if external, false if relative
 */
export function isExternalUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Process image URL from backend - if it's already a full URL, use it as is
 * If it's a relative path, convert it using getMediaUrl
 * @param imageUrl - URL from backend
 * @returns Processed URL ready for use
 */
export function processImageUrl(imageUrl: string): string {
  if (!imageUrl) return '';
  
  // If it's already a full URL, use it as is
  if (isExternalUrl(imageUrl)) {
    return imageUrl;
  }
  
  // If it's a relative path, process it
  return getMediaUrl(imageUrl);
}

/**
 * Get the hostname from a media URL for Next.js image configuration
 * @param url - Full URL
 * @returns hostname or null if not external
 */
export function getMediaHostname(url: string): string | null {
  if (!isExternalUrl(url)) return null;
  
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}
