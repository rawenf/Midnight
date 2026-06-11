/**
 * Validates and sanitizes user-provided URLs against Stored XSS.
 * Permitted protocols: http://, https://, mailto:, tel:, data:image/, or relative paths starting with /
 */
export function getSafeUrl(url: string | undefined | null): string {
  if (!url) return '#';

  const trimmedUrl = url.trim();
  const lowerUrl = trimmedUrl.toLowerCase();

  if (
    lowerUrl.startsWith('http://') ||
    lowerUrl.startsWith('https://') ||
    lowerUrl.startsWith('mailto:') ||
    lowerUrl.startsWith('tel:') ||
    lowerUrl.startsWith('data:image/') ||
    lowerUrl.startsWith('/')
  ) {
    return trimmedUrl;
  }

  console.warn('Blocked unsafe URL:', url);
  return '#';
}
