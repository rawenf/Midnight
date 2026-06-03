/**
 * Security utility functions for the application
 */

/**
 * Validates and sanitizes a URL against a highly secure allowlist.
 * Prevents Stored XSS by only permitting safe protocols and paths.
 *
 * @param url The URL to sanitize
 * @param fallbackUrl The URL to use if the input is invalid (defaults to '#')
 * @returns A safe URL string
 */
export function getSafeUrl(url: string | undefined | null, fallbackUrl = '#'): string {
  if (!url) return fallbackUrl;

  // Clean whitespace
  const cleanUrl = url.trim();

  // Case-insensitive check
  const lowerUrl = cleanUrl.toLowerCase();

  // Allow list: http://, https://, mailto:, tel:, data:image/, or relative paths starting with /
  const isHttp = lowerUrl.startsWith('http://');
  const isHttps = lowerUrl.startsWith('https://');
  const isMailto = lowerUrl.startsWith('mailto:');
  const isTel = lowerUrl.startsWith('tel:');
  const isDataImage = lowerUrl.startsWith('data:image/');
  const isRelative = lowerUrl.startsWith('/');

  if (isHttp || isHttps || isMailto || isTel || isDataImage || isRelative) {
    return cleanUrl;
  }

  return fallbackUrl;
}
