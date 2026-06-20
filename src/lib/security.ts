export function getSafeUrl(url: string | null | undefined): string {
  if (!url) return '#';
  try {
    if (url.startsWith('/')) return url;
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol.toLowerCase();
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    if (allowedProtocols.includes(protocol) || url.toLowerCase().startsWith('data:image/')) {
      return url;
    }
    return '#';
  } catch (e) {
    return '#';
  }
}
