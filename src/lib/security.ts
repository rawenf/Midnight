/**
 * Validates and sanitizes a URL to prevent Stored XSS via javascript: URIs.
 * Only allows specific safe protocols or relative paths.
 *
 * @param url The user-provided URL to sanitize.
 * @param fallback The safe fallback URL if the provided URL is invalid. Defaults to '#'.
 * @returns The original URL if safe, otherwise the fallback.
 */
export function getSafeUrl(url: string | null | undefined, fallback: string = '#'): string {
  if (!url) return fallback;

  try {
    // Check if it's a relative path (starts with / or . or #)
    if (/^[/#.]/.test(url)) {
      return url;
    }

    // Try parsing as a full URL
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol.toLowerCase();

    // Allowlist of safe protocols
    const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:', 'data:'];

    // For data URIs, we might want to restrict to images only
    if (protocol === 'data:' && !url.toLowerCase().startsWith('data:image/')) {
        return fallback;
    }

    if (safeProtocols.includes(protocol)) {
      return url;
    }

    return fallback;
  } catch (error) {
    // If URL parsing fails, it's likely an invalid or malformed URL.
    return fallback;
  }
}
