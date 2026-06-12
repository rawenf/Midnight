/**
 * Security utility to sanitize URLs and prevent Stored XSS vulnerabilities.
 * Ensures URLs use safe protocols before being used in href attributes or window.open.
 */
export function getSafeUrl(url: string | undefined | null, fallback = '#'): string {
  if (!url) return fallback;

  try {
    if (url.startsWith('/')) {
      return url;
    }

    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol.toLowerCase();

    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];

    if (allowedProtocols.includes(protocol)) {
      return url;
    }

    if (protocol === 'data:' && parsedUrl.pathname.toLowerCase().startsWith('image/')) {
      return url;
    }

    console.warn('Security: Blocked potentially unsafe URL protocol:', protocol);
    return fallback;
  } catch (error) {
    if (url.startsWith('#')) {
      return url;
    }
    console.warn('Security: Blocked invalid URL format:', url);
    return fallback;
  }
}
