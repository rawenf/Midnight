/**
 * Validates and sanitizes user-provided URLs against Stored XSS.
 * Only permits http://, https://, data:image/ URIs, or relative paths starting with /.
 */
export function getSafeUrl(url: string | undefined | null, fallback: string = '#'): string {
  if (!url) return fallback;

  try {
    // Allow relative paths
    if (url.startsWith('/')) {
      return url;
    }

    // Allow data URIs for images
    if (url.startsWith('data:image/')) {
      return url;
    }

    // Check protocols
    const parsedUrl = new URL(url, window.location.origin);
    const protocol = parsedUrl.protocol.toLowerCase();

    if (protocol === 'http:' || protocol === 'https:') {
      return url;
    }
  } catch (e) {
    // If URL parsing fails, it's not a valid URL
    return fallback;
  }

  return fallback;
}
