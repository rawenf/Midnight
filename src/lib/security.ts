export function getSafeUrl(url: string | null | undefined): string {
  if (!url) return '#';

  try {
    // Allow relative URLs starting with '/'
    if (url.startsWith('/')) {
      return url;
    }

    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol.toLowerCase();

    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:', 'data:'];

    if (allowedProtocols.includes(protocol)) {
      // Additional check for data: image URIs
      if (protocol === 'data:' && !url.startsWith('data:image/')) {
        return '#';
      }
      return url;
    }
  } catch (e) {
    // Invalid URL
    return '#';
  }

  return '#';
}
