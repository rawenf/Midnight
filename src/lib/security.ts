/**
 * Security utilities for data sanitization and validation.
 */

/**
 * Validates a URL to prevent Stored XSS via dangerous protocols like javascript: or vbscript:
 * Returns the URL if it's safe (http/https/mailto/tel/data:image/relative), or a fallback '#' if it's unsafe.
 */
export function getSafeUrl(url: string | undefined | null, fallback = '#'): string {
  if (!url) return fallback;

  try {
    // Allow relative URLs, fragments, and queries
    if (url.startsWith('/') || url.startsWith('#') || url.startsWith('?')) {
      return url;
    }

    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol.toLowerCase();

    // Allowed safe protocols
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(protocol)) {
      return url;
    }

    // Allow specific data URIs (images only)
    if (protocol === 'data:' && parsedUrl.pathname.toLowerCase().startsWith('image/')) {
      return url;
    }

    console.warn(`[Security] Blocked unsafe URL protocol: ${protocol}`);
    return fallback;
  } catch (e) {
    // If URL parsing fails, it's likely malformed. Fail securely.
    return fallback;
  }
}
