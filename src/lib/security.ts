export function getSafeUrl(url: string | null | undefined): string {
  if (!url) return '#';

  const trimmedUrl = url.trim();
  if (trimmedUrl.startsWith('/')) return trimmedUrl;

  try {
    const parsed = new URL(trimmedUrl);
    const protocol = parsed.protocol.toLowerCase();

    if (['http:', 'https:', 'mailto:', 'tel:'].includes(protocol)) {
      return trimmedUrl;
    }

    if (protocol === 'data:' && trimmedUrl.toLowerCase().startsWith('data:image/')) {
      return trimmedUrl;
    }

    return '#';
  } catch (e) {
    return '#';
  }
}
