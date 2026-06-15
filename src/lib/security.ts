/**
 * Validates and sanitizes a user-provided URL against Stored XSS.
 * Only permits http://, https://, mailto:, tel:, data:image/ URIs, or relative paths.
 *
 * @param url The user-provided URL to validate.
 * @returns The sanitized URL or '#' if invalid.
 */
export function getSafeUrl(url: string | undefined | null): string {
  if (!url) return '#';

  try {
    const parsedUrl = new URL(url, window.location.origin);
    const protocol = parsedUrl.protocol.toLowerCase();

    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];

    if (allowedProtocols.includes(protocol)) {
      return url;
    }

    if (protocol === 'data:' && url.toLowerCase().startsWith('data:image/')) {
        return url;
    }

    // allow relative urls
    if (url.startsWith('/')) {
        return url;
    }

    console.warn(`[Security] Blocked potentially unsafe URL: ${url}`);
    return '#';
  } catch (e) {
    // If it's not a valid URL format (e.g. just '#'), fallback to allowing relative fragments/paths
    if (url.startsWith('/') || url.startsWith('#')) {
      return url;
    }
    console.warn(`[Security] Blocked malformed URL: ${url}`);
    return '#';
  }
}
