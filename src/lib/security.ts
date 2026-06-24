export function getSafeUrl(url: string | undefined): string {
  if (!url) return '#';
  try {
    const parsed = new URL(url, window.location.origin);
    const protocol = parsed.protocol.toLowerCase();
    if (['http:', 'https:', 'mailto:', 'tel:', 'data:'].includes(protocol)) {
      if (protocol === 'data:' && !url.toLowerCase().startsWith('data:image/')) {
        return '#';
      }
      return url;
    }
    return '#';
  } catch (e) {
    if (url.startsWith('/')) return url;
    return '#';
  }
}
