/**
 * Validates and sanitizes a URL to prevent Stored XSS via javascript: URIs.
 * Ensures the URL uses http: or https: protocols.
 *
 * @param url The URL to sanitize
 * @param fallbackUrl The URL to return if the input is invalid or unsafe (defaults to '#')
 * @returns The sanitized URL or the fallback
 */
export function getSafeUrl(url?: string | null, fallbackUrl: string = '#'): string {
  if (!url) return fallbackUrl;

  try {
    const parsedUrl = new URL(url, window.location.origin);
    if (['http:', 'https:'].includes(parsedUrl.protocol)) {
      return parsedUrl.href;
    }
    return fallbackUrl;
  } catch (e) {
    // If URL parsing fails, check if it's a relative path starting with /
    if (url.startsWith('/')) {
      return url;
    }
    return fallbackUrl;
  }
}
