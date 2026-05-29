/**
 * Validates and sanitizes a URL to prevent XSS.
 * Only allows http://, https://, or relative paths.
 */
export function getSafeUrl(url: string | undefined | null): string {
  if (!url) return '#';

  try {
    const parsedUrl = new URL(url, window.location.origin);
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:' || url.startsWith('/')) {
      return url;
    }
    return '#'; // Fallback for unsafe protocols like javascript: or data:
  } catch (e) {
    // If URL parsing fails, check if it's a relative path
    if (url.startsWith('/')) {
      return url;
    }
    return '#';
  }
}
