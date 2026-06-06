export function getSafeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    // Check if it's a relative URL
    if (url.startsWith('/')) return url;

    const parsedUrl = new URL(url, 'http://dummy.com'); // Base needed for relative checks but we handled that
    const protocol = parsedUrl.protocol.toLowerCase();

    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:', 'data:'];
    if (protocol === 'data:' && !url.toLowerCase().startsWith('data:image/')) {
        return undefined;
    }

    if (allowedProtocols.includes(protocol)) {
      return url;
    }
    return undefined;
  } catch (e) {
    return undefined; // Invalid URL
  }
}
