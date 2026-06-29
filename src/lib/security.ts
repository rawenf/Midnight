/**
 * SECURITY: Validates and sanitizes user-provided URLs to prevent Stored XSS.
 * React does not sanitize href attributes against javascript: URIs.
 * Only allows safe protocols and relative paths.
 */
export function getSafeUrl(url: string | undefined | null, fallback: string = '#'): string {
  if (!url) return fallback;

  const sanitized = url.trim();
  const lowerUrl = sanitized.toLowerCase();

  const isSafe =
    lowerUrl.startsWith('http://') ||
    lowerUrl.startsWith('https://') ||
    lowerUrl.startsWith('mailto:') ||
    lowerUrl.startsWith('tel:') ||
    lowerUrl.startsWith('data:image/') ||
    sanitized.startsWith('/');

  return isSafe ? sanitized : fallback;
}
