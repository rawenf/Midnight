export function getSafeUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;

  // Don't modify fragment-only URLs
  if (url.startsWith('#')) return url;

  try {
    const parsedUrl = new URL(url, window.location.origin);
    const safeProtocols = ['http:', 'https:'];

    // Only allow safe protocols to prevent XSS (e.g. javascript:)
    if (safeProtocols.includes(parsedUrl.protocol)) {
      return url;
    }
  } catch (e) {
    // If URL parsing fails, it's likely a relative URL which is safe,
    // or invalid which should just be returned as is and let the browser handle it.
    // However, if it starts with 'javascript:' or similar, we should block it.
    const lowerUrl = url.toLowerCase().trim();
    if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('data:text/html') || lowerUrl.startsWith('vbscript:')) {
      return '#';
    }
    return url;
  }

  // Return '#' as a safe fallback if it's an invalid or dangerous absolute URL
  return '#';
}
