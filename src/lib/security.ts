/**
 * Validates and sanitizes a URL against a strict allowlist.
 * Prevents Stored XSS via javascript: or vbscript: URIs.
 */
export function getSafeUrl(url: string | null | undefined): string {
  if (!url) return '#';
  const trimmedUrl = url.trim();
  const lowerUrl = trimmedUrl.toLowerCase();

  const safeProtocols = ['http://', 'https://', 'mailto:', 'tel:', 'data:image/'];
  const isSafeProtocol = safeProtocols.some(protocol => lowerUrl.startsWith(protocol));
  const isRelative = lowerUrl.startsWith('/');
  const isAnchor = lowerUrl.startsWith('#');

  if (isSafeProtocol || isRelative || isAnchor) {
    return trimmedUrl;
  }

  return '#';
}
