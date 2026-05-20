/**
 * Security utility to explicitly validate and sanitize user-provided URLs against Stored XSS
 * prior to usage in `href` attributes or `window.open` calls.
 *
 * React does not sanitize `href` against `javascript:` URIs, creating a risk for Stored XSS
 * if the data originates from user input.
 */
export function getSafeUrl(url: string | undefined | null, fallback: string = '#'): string {
  if (!url) return fallback;

  try {
    const parsedUrl = new URL(url, 'http://dummy.com');
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:', 'blob:'];

    if (allowedProtocols.includes(parsedUrl.protocol)) {
      return url;
    }

    if (url.startsWith('/') || url.startsWith('#')) {
      return url;
    }

    return fallback;
  } catch (error) {
    return fallback;
  }
}
