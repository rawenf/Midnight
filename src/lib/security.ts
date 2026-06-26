/**
 * Sanitizes URLs to prevent Stored XSS via javascript: or vbscript: URIs.
 * Allows safe protocols (http, https, mailto, tel) and valid data:image/ URIs,
 * or relative/absolute paths.
 */
export function getSafeUrl(url: string | undefined | null, fallback: string = '#'): string {
  if (!url) return fallback;

  try {
    if (url.startsWith('/')) return url;

    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol.toLowerCase();

    if (['http:', 'https:', 'mailto:', 'tel:', 'data:'].includes(protocol)) {
      if (protocol === 'data:' && !url.toLowerCase().startsWith('data:image/')) {
        return fallback;
      }
      return url;
    }
    return fallback;
  } catch (e) {
    return fallback;
  }
}
