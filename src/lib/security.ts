export function getSafeUrl(url: string | null | undefined, fallback = '#'): string {
  if (!url) return fallback;
  try {
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith('/')) {
      return trimmedUrl;
    }
    const parsedUrl = new URL(trimmedUrl);
    const protocol = parsedUrl.protocol.toLowerCase();
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(protocol)) {
      return trimmedUrl;
    }
    if (protocol === 'data:' && trimmedUrl.toLowerCase().startsWith('data:image/')) {
      return trimmedUrl;
    }
    return fallback;
  } catch (error) {
    return fallback;
  }
}
