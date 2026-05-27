/**
 * Validates and sanitizes a URL against malicious schemes (e.g., javascript:, data:).
 * Prevents Stored XSS by enforcing http/https protocols or relative paths.
 */
export function getSafeUrl(url: string | undefined | null, fallback = "#"): string {
  if (!url) return fallback;

  const trimmedUrl = url.trim();

  // Allow only http and https protocols explicitly
  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  // Allow relative paths (starting with /)
  if (trimmedUrl.startsWith('/')) {
    return trimmedUrl;
  }

  return fallback;
}
