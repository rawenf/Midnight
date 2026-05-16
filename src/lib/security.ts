/**
 * Security utilities for the application.
 */

/**
 * Validates and sanitizes user-provided URLs to prevent Stored XSS via javascript: URIs.
 * React does not automatically sanitize href attributes.
 *
 * @param url The URL to sanitize.
 * @param fallback The fallback URL if the provided URL is unsafe or empty.
 * @returns A safe URL string.
 */
export function getSafeUrl(url: string | null | undefined, fallback: string = '#'): string {
  if (!url) {
    return fallback;
  }

  // Remove leading/trailing whitespace
  const trimmedUrl = url.trim();

  // Check if it's a relative URL or absolute path (safe)
  if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('#') || trimmedUrl.startsWith('?')) {
    return trimmedUrl;
  }

  try {
    const parsedUrl = new URL(trimmedUrl, window.location.origin);
    const protocol = parsedUrl.protocol.toLowerCase();

    // Only allow http:, https:, mailto:, and tel: protocols
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(protocol)) {
      return trimmedUrl; // Return the original trimmed URL to preserve any specific formatting
    }

    // Security concern: the URL uses an unsafe protocol (e.g. javascript:, vbscript:, data:)
    console.warn('Security: Blocked unsafe URL protocol', protocol);
    return fallback;
  } catch (e) {
    // If it's not a valid URL (and not relative), consider it unsafe just in case,
    // though in many cases it might just be a malformed string.
    // However, since it doesn't parse, it could be something like "javascript:alert(1)" without a base.

    // Fallback simple check if URL parsing fails but might still be a protocol
    const lowerUrl = trimmedUrl.toLowerCase();
    if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('vbscript:') || lowerUrl.startsWith('data:')) {
      console.warn('Security: Blocked explicitly unsafe URL string');
      return fallback;
    }

    // If it's just a string like "www.example.com", we could optionally prepend https://,
    // but for strict security it's better to require valid protocols or be explicit.
    // We'll allow it if it doesn't look like an evil protocol.
    return trimmedUrl;
  }
}
