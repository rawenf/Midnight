/**
 * Security utilities to protect against common vulnerabilities like XSS.
 */

/**
 * Validates and sanitizes a URL to prevent Stored XSS via malicious protocols.
 * Only allows http://, https://, data:image/ URIs, or relative paths.
 *
 * @param url The user-provided URL to sanitize
 * @param fallbackUrl The safe URL to return if validation fails (defaults to '#')
 * @returns A safe URL string
 */
export function getSafeUrl(url: string | null | undefined, fallbackUrl = '#'): string {
  if (!url) return fallbackUrl;

  try {
    if (url.startsWith('/')) {
      return url;
    }

    const parsedUrl = new URL(url, window.location.origin);
    const protocol = parsedUrl.protocol.toLowerCase();

    if (['http:', 'https:', 'data:'].includes(protocol)) {
      if (protocol === 'data:') {
        if (!url.toLowerCase().startsWith('data:image/')) {
          return fallbackUrl;
        }
      }
      return url;
    }

    console.warn(`[Security] Blocked potentially unsafe URL with protocol: ${protocol}`);
    return fallbackUrl;
  } catch (e) {
    return fallbackUrl;
  }
}
