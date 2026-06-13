export function getSafeUrl(url: string | undefined | null, fallback = '#'): string {
  if (!url) return fallback;

  const trimmedUrl = url.trim();

  if (trimmedUrl.startsWith('/')) return trimmedUrl;

  try {
    const parsedUrl = new URL(trimmedUrl);
    const protocol = parsedUrl.protocol.toLowerCase();

    if (['http:', 'https:', 'mailto:', 'tel:'].includes(protocol)) {
      return trimmedUrl;
    }

    if (protocol === 'data:' && trimmedUrl.toLowerCase().startsWith('data:image/')) {
      return trimmedUrl;
    }

    return fallback;
  } catch (e) {
    // If parsing fails, it might be a relative path without a leading slash.
    // Ensure it doesn't contain a colon to prevent bypasses like ' javascript:...'
    if (!trimmedUrl.includes(':')) {
      return trimmedUrl;
    }
    return fallback;
  }
}
