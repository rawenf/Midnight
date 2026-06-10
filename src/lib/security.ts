/**
 * Security utility to sanitize user-provided URLs against Stored XSS vulnerabilities.
 * It uses a case-insensitive allowlist approach, strictly permitting only safe protocols
 * or relative paths starting with '/'.
 */
export function getSafeUrl(url: string | undefined | null): string {
  if (!url) return '#';

  // Allow relative paths
  if (url.startsWith('/')) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol.toLowerCase();

    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];

    if (allowedProtocols.includes(protocol)) {
      return url;
    }

    // Special case for data:image/ URIs
    if (protocol === 'data:' && parsedUrl.pathname.toLowerCase().startsWith('image/')) {
      return url;
    }

    console.warn('Security: Blocked potentially unsafe URL protocol', protocol);
    return '#';
  } catch (e) {
    console.warn('Security: Blocked invalid URL', url);
    return '#';
  }
}
