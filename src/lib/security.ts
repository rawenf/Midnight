/**
 * Validates and sanitizes a URL to prevent XSS attacks.
 */
export function getSafeUrl(url: string | undefined | null, fallback = '#'): string {
  if (!url) return fallback;
  try {
    if (url.startsWith('/')) return url;
    const parsedUrl = new URL(url);
    if (['http:', 'https:'].includes(parsedUrl.protocol)) {
      return parsedUrl.toString();
    }
    console.warn('Security: Blocked potentially unsafe URL protocol', parsedUrl.protocol);
    return fallback;
  } catch (e) {
    console.warn('Security: Blocked malformed URL');
    return fallback;
  }
}
