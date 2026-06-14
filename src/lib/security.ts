/**
 * Security utilities for the application.
 */

/**
 * Validates and sanitizes a URL to prevent Stored XSS.
 * Only allows safe protocols (http, https, mailto, tel) or relative paths.
 * Returns '#' if the URL is unsafe.
 */
export function getSafeUrl(url: string | undefined | null): string {
  if (!url) return '#';

  try {
    const trimmedUrl = url.trim();
    // Allow relative paths
    if (trimmedUrl.startsWith('/')) return trimmedUrl;

    // Parse URL (will throw if invalid)
    const parsedUrl = new URL(trimmedUrl);

    // Check protocol against allowlist (case-insensitive)
    const protocol = parsedUrl.protocol.toLowerCase();
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:', 'data:'];

    if (!allowedProtocols.includes(protocol)) {
      console.warn(`[Security] Blocked unsafe URL protocol: ${protocol}`);
      return '#';
    }

    // Additional check for data URIs to only allow images
    if (protocol === 'data:' && !trimmedUrl.toLowerCase().startsWith('data:image/')) {
      console.warn('[Security] Blocked non-image data URI');
      return '#';
    }

    return trimmedUrl;
  } catch (e) {
    // If it's not a valid URL structure and not a relative path, block it
    console.warn('[Security] Blocked invalid URL structure');
    return '#';
  }
}
