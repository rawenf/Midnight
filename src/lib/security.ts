export function getSafeUrl(url: string | undefined | null, fallback = '#'): string {
  if (!url) return fallback;
  try {
    const trimmed = url.trim();
    // Allow relative paths
    if (trimmed.startsWith('/')) return trimmed;

    // Check protocol
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol.toLowerCase();

    if (['http:', 'https:', 'mailto:', 'tel:'].includes(protocol) ||
        (protocol === 'data:' && parsed.pathname.startsWith('image/'))) {
      return trimmed;
    }
  } catch (e) {
    // If URL parsing fails, it might be a relative URL not caught above,
    // or just an invalid URL. To be safe, return fallback.
  }
  return fallback;
}
