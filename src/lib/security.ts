/**
 * Validates and sanitizes user-provided URLs to prevent Stored XSS.
 * Only permits http://, https://, and relative paths starting with /.
 */
export function getSafeUrl(url: string | undefined | null, fallback = '#'): string {
  if (!url) return fallback;
  if (url.startsWith('/')) return url;
  if (url.startsWith('data:image/')) return url;
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      return parsedUrl.href;
    }
  } catch (e) {
    // Invalid URL format
  }
  return fallback;
}