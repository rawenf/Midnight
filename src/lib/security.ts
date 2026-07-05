export function getSafeUrl(url: string, fallback: string = '#'): string {
  if (!url) return fallback;
  if (url.startsWith('/')) return url;

  try {
    const parsed = new URL(url);
    const protocol = parsed.protocol.toLowerCase();
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(protocol)) {
      return url;
    }
    if (protocol === 'data:' && url.toLowerCase().startsWith('data:image/')) {
      return url;
    }
    return fallback;
  } catch (e) {
    return fallback;
  }
}
