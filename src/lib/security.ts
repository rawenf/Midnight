/**
 * Security Utility
 * Explicitly validates and sanitizes user-provided URLs against Stored XSS.
 * Uses a case-insensitive allowlist approach.
 */
export function getSafeUrl(url: string | null | undefined, fallback: string = '#'): string {
  if (!url) return fallback;

  const trimmedUrl = url.trim();
  if (trimmedUrl.startsWith('/')) {
    return trimmedUrl;
  }

  const lowerUrl = trimmedUrl.toLowerCase();

  const isAllowed =
    lowerUrl.startsWith('http://') ||
    lowerUrl.startsWith('https://') ||
    lowerUrl.startsWith('mailto:') ||
    lowerUrl.startsWith('tel:') ||
    lowerUrl.startsWith('data:image/');

  return isAllowed ? trimmedUrl : fallback;
}
