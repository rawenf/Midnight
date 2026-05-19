/**
 * Validates and sanitizes a URL against Stored XSS by ensuring it uses a safe protocol.
 * React does not automatically sanitize `href` attributes against `javascript:` URIs.
 *
 * @param url The user-provided URL to validate
 * @param fallbackUrl The URL to return if validation fails (defaults to '#')
 * @returns The sanitized URL or the fallback
 */
export function getSafeUrl(url: string | undefined | null, fallbackUrl: string = '#'): string {
  if (!url) return fallbackUrl;

  try {
    const parsedUrl = new URL(url, window.location.origin);
    const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];

    if (safeProtocols.includes(parsedUrl.protocol)) {
      return url;
    }

    console.warn(`Blocked unsafe URL protocol: ${parsedUrl.protocol}`);
    return fallbackUrl;
  } catch (error) {
    // If URL parsing fails, it's safer to block it (e.g., malformed URLs that might bypass checks)
    // However, for relative paths, they might be valid. For absolute safety when dealing with user input,
    // we should ideally only allow full URLs or very specific relative paths.
    // For this context, assuming user inputs are external links:

    // Check if it's a relative path starting with /
    if (url.startsWith('/')) {
        return url;
    }

    console.warn('Failed to parse URL for security validation.', url);
    return fallbackUrl;
  }
}
