/**
 * Security Utility: URL Sanitization
 * Prevents Stored XSS via malicious URI schemes (e.g., javascript:, data:, vbscript:)
 * by strictly allowing only http://, https://, or relative paths starting with /.
 */
export function getSafeUrl(url: string | undefined | null, fallback = '#'): string {
  if (!url) return fallback;
  try {
    const parsedUrl = new URL(url, window.location.origin);
    if (['http:', 'https:'].includes(parsedUrl.protocol)) {
      return url;
    }
    return fallback;
  } catch {
    if (url.startsWith('/')) {
      return url;
    }
    return fallback;
  }
}
