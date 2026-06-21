export function getSafeUrl(url: string | null | undefined): string {
  if (!url) return '#';

  try {
    const parsed = new URL(url, window.location.origin);
    const protocol = parsed.protocol.toLowerCase();

    if (['http:', 'https:', 'mailto:', 'tel:', 'data:'].includes(protocol)) {
      if (protocol === 'data:' && !parsed.pathname.startsWith('image/')) {
        return '#';
      }
      return url;
    }
  } catch (e) {
    if (url.startsWith('/') || url.startsWith('#')) {
      return url;
    }
  }

  return '#';
}
