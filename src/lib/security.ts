export function getSafeUrl(url: string | undefined | null): string {
  if (!url) return '#';
  const trimmedUrl = url.trim();
  try {
    if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('#')) return trimmedUrl;
    const parsedUrl = new URL(trimmedUrl);
    const protocol = parsedUrl.protocol.toLowerCase();
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(protocol)) return trimmedUrl;
    if (protocol === 'data:' && trimmedUrl.toLowerCase().startsWith('data:image/')) return trimmedUrl;
    return '#';
  } catch (e) {
    const lowerUrl = trimmedUrl.toLowerCase();
    if (lowerUrl.startsWith('http://') || lowerUrl.startsWith('https://') || lowerUrl.startsWith('mailto:') || lowerUrl.startsWith('tel:') || lowerUrl.startsWith('data:image/') || lowerUrl.startsWith('/') || lowerUrl.startsWith('#')) {
      return trimmedUrl;
    }
    return '#';
  }
}
