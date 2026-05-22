/**
 * Security utilities for the application.
 */

/**
 * Validates and sanitizes a URL against malicious protocols (like javascript:).
 * Ensures the URL uses safe protocols (http, https, mailto, tel).
 * Fallback to a safe URL if the input is unsafe.
 *
 * @param url The user-provided URL string to validate.
 * @param fallback The fallback URL to return if validation fails (default: '#').
 * @returns The sanitized URL or the fallback.
 */
export function getSafeUrl(url: string | undefined | null, fallback: string = '#'): string {
  if (!url) return fallback;

  try {
    // If it's a relative URL, URL constructor will throw without a base.
    // We treat relative URLs as safe if they start with /
    if (url.startsWith('/')) {
        return url;
    }

    // Check if it's absolute by trying to parse it with a dummy base
    // This catches javascript: protocols even if they look weird
    const parsedUrl = new URL(url, 'http://dummy.base');

    // Only allow specific safe protocols
    const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    if (safeProtocols.includes(parsedUrl.protocol)) {
        return url;
    }

    // Protocol is not in the safe list (e.g., javascript:, data:, file:)
    console.warn(`[Security] Blocked potentially unsafe URL with protocol: ${parsedUrl.protocol}`);
    return fallback;
  } catch (error) {
    // If parsing fails completely, fallback.
    return fallback;
  }
}
