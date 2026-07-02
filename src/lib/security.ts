/**
 * Validates and sanitizes a URL against Stored XSS by enforcing an allowlist of safe protocols.
 * Permits http:, https:, mailto:, tel:, data:image/ URIs, or relative paths starting with /.
 *
 * @param url The user-provided URL to sanitize.
 * @param fallback The safe fallback URL to return if the input is invalid (defaults to '#').
 * @returns The original URL if safe, otherwise the fallback.
 */
export const getSafeUrl = (url: string | undefined | null, fallback: string = '#'): string => {
  if (!url) return fallback;

  try {
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith('/')) return trimmedUrl;

    const parsedUrl = new URL(trimmedUrl);
    const protocol = parsedUrl.protocol.toLowerCase();

    if (['http:', 'https:', 'mailto:', 'tel:'].includes(protocol)) {
      return trimmedUrl;
    }

    if (protocol === 'data:' && trimmedUrl.toLowerCase().startsWith('data:image/')) {
        return trimmedUrl;
    }

    console.warn(`Blocked unsafe URL protocol: ${protocol}`);
    return fallback;
  } catch (e) {
    // If it's not a valid URL format and doesn't start with '/', it's likely unsafe or malformed
    return fallback;
  }
};
