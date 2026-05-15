/**
 * Security utility functions for the application.
 */

/**
 * Validates and sanitizes a URL to prevent Cross-Site Scripting (XSS).
 * Explicitly allows only safe protocols (http, https, data:image, mailto, tel)
 * or relative paths. Prevents malicious pseudo-protocols like javascript: or vbscript:.
 *
 * @param url The user-provided URL to sanitize
 * @param fallbackUrl The URL to return if the provided URL is invalid or unsafe (defaults to '#')
 * @returns A safe URL string
 */
export function getSafeUrl(url: string | null | undefined, fallbackUrl = '#'): string {
  if (!url) return fallbackUrl;

  // Trim whitespace
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return fallbackUrl;

  // Check if it's a relative URL or fragment
  if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('#') || trimmedUrl.startsWith('?')) {
    return trimmedUrl;
  }

  try {
    // Attempt to parse the URL
    // If it's not a valid URL format, URL constructor will throw
    const parsedUrl = new URL(trimmedUrl);

    // Explicit list of allowed protocols
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:', 'data:'];

    if (allowedProtocols.includes(parsedUrl.protocol)) {
      // For data URIs, we only want to allow images, not SVGs (which can contain scripts) or HTML
      if (parsedUrl.protocol === 'data:') {
        if (trimmedUrl.startsWith('data:image/') && !trimmedUrl.includes('image/svg+xml')) {
          return trimmedUrl;
        }
        return fallbackUrl; // Reject unsafe data URIs
      }
      return trimmedUrl;
    }

    // Reject any other protocol (javascript:, vbscript:, file:, etc)
    console.warn(`[Security] Blocked unsafe URL protocol: ${parsedUrl.protocol}`);
    return fallbackUrl;
  } catch (e) {
    // If URL parsing fails, it might be a malformed URL or just a plain string without protocol
    // In strict mode, we'd reject it, but to be forgiving with user input like "www.example.com",
    // we could prepend https:// and try again, but for now we just return the fallback.
    return fallbackUrl;
  }
}
