import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks while allowing safe formatting
 * @param html - The HTML string to sanitize
 * @param options - Optional configuration for allowed tags and attributes
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(
  html: string,
  options?: {
    allowedTags?: string[];
    allowedAttributes?: string[];
    allowDataAttributes?: boolean;
  }
): string {
  const defaultConfig = {
    ALLOWED_TAGS: options?.allowedTags || ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: options?.allowedAttributes || ['href', 'target'],
    ALLOW_DATA_ATTR: options?.allowDataAttributes || false,
    // Ensure links open in new tab for security
    ADD_ATTR: ['target'],
    FORBID_ATTR: ['style', 'class', 'id', 'onclick', 'onload', 'onerror'],
  };

  return DOMPurify.sanitize(html, defaultConfig);
}

/**
 * Sanitizes HTML for basic text formatting only (no links)
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string with only basic formatting
 */
export function sanitizeBasicHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
    allowedAttributes: [],
    allowDataAttributes: false,
  });
}

/**
 * Strips all HTML tags and returns plain text
 * @param html - The HTML string to strip
 * @returns Plain text without any HTML tags
 */
export function stripHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}
