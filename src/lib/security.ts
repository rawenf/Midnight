/**
 * Security utilities for the application.
 */

/**
 * Validates and sanitizes a user-provided URL to prevent Stored XSS via javascript: URIs.
 * Uses a case-insensitive allowlist approach.
 *
 * @param url The user-provided URL string
 * @param fallback The fallback URL if the provided URL is unsafe (default: "#")
 * @returns The sanitized URL or the fallback
 */
export function getSafeUrl(url: string | undefined | null, fallback: string = '#'): string {
  if (!url) return fallback;

  try {
    // Trim whitespace
    const trimmedUrl = url.trim();

    // Check if it's a relative path starting with '/'
    if (trimmedUrl.startsWith('/')) {
      return trimmedUrl;
    }

    // Parse URL to extract protocol (throws if invalid and not relative)
    const parsed = new URL(trimmedUrl);
    const protocol = parsed.protocol.toLowerCase();

    // Allowlist of safe protocols
    const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:', 'data:'];

    if (safeProtocols.includes(protocol)) {
      // Additional check for data URIs to only allow images
      if (protocol === 'data:' && !trimmedUrl.toLowerCase().startsWith('data:image/')) {
        return fallback;
      }
      return trimmedUrl;
    }

    return fallback;
  } catch (e) {
    // If URL parsing fails, it might be a relative path or invalid
    // Since we already checked for starting with '/', we just fallback
    return fallback;
  }
}
