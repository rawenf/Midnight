export function getSafeUrl(url: string | null | undefined, fallback: string = '#'): string {
  if (!url) return fallback;
  try {
    // Treat the URL relative to a dummy origin to correctly parse protocol
    const parsedUrl = new URL(url, 'http://localhost');
    const protocol = parsedUrl.protocol.toLowerCase();

    // Only allow http, https, and mailto protocols
    if (['http:', 'https:', 'mailto:'].includes(protocol)) {
      return url;
    }

    return fallback;
  } catch (e) {
    // If URL parsing fails, it's either an invalid URL or a relative path (if we didn't use a dummy base)
    // For safety against javascript: and data: URIs, we fallback
    return fallback;
  }
}
