/**
 * Security utility functions
 */

/**
 * Validates and sanitizes a URL against Stored XSS and other malicious payloads.
 * Only allows safe protocols (http, https) or valid relative paths.
 * Returns a safe URL string or the fallback URL if invalid.
 *
 * @param url The URL to validate
 * @param fallback The fallback URL if the input is invalid (default: '#')
 * @returns A sanitized URL safe for href or window.open
 */
export function getSafeUrl(url: string | undefined | null, fallback = '#'): string {
  if (!url) return fallback;

  try {
    // Attempt to parse the URL
    // This will throw if the URL is completely invalid, but not for relative URLs
    // if we don't provide a base. So we provide a dummy base for parsing relative URLs.
    const parsedUrl = new URL(url, 'http://dummy.com');
    const protocol = parsedUrl.protocol.toLowerCase();

    // Only allow http: and https: protocols to prevent javascript:, data:, vbscript: URIs
    if (['http:', 'https:'].includes(protocol)) {
      // If it was a relative URL parsed with dummy base, return original
      if (parsedUrl.hostname === 'dummy.com' && !url.startsWith('http')) {
         if (url.startsWith('/') || url.startsWith('#') || url.startsWith('?')) {
            return url;
         }
         return fallback;
      }
      return url;
    }

    return fallback;
  } catch (error) {
    // If parsing completely fails, it might be a valid relative path like /path or #hash
    if (url.startsWith('/') || url.startsWith('#') || url.startsWith('?')) {
      return url;
    }
    return fallback;
  }
}
