/**
 * Security utility functions for the application.
 */

/**
 * Validates and sanitizes a user-provided URL to prevent Stored XSS attacks via javascript: URIs.
 * Only allows http://, https://, or relative URLs.
 *
 * @param url The URL to sanitize
 * @param fallback The fallback URL if the provided one is invalid or unsafe (defaults to '#')
 * @returns A safe URL string
 */
export function getSafeUrl(url: string | undefined | null, fallback: string = '#'): string {
  if (!url) return fallback;

  try {
    // Check if it's a relative URL or absolute path without protocol
    if (url.startsWith('/') || url.startsWith('#') || url.startsWith('?')) {
      return url;
    }

    // Try to parse it as a full URL
    const parsedUrl = new URL(url);

    // Explicitly allow only http and https protocols
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      return parsedUrl.toString();
    }

    // If it's a javascript: or other potentially unsafe protocol, return fallback
    return fallback;
  } catch (error) {
    // If URL parsing fails (e.g., malformed URL), it might be a relative path without leading slash
    // But to be strictly safe against edge cases, if we can't parse it as a valid URL,
    // and it doesn't match our strict relative patterns above, we reject it.

    // Exception: Allow plain alphanumeric strings with no protocol/colon as relative links
    if (/^[a-zA-Z0-9_\-\.]+$/.test(url)) {
        return url;
    }

    console.warn('Invalid or potentially unsafe URL provided, falling back to safe default.', { originalUrl: url });
    return fallback;
  }
}
