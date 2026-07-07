export function getSafeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;

  try {
    const parsedUrl = new URL(url, 'http://localhost');
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:', 'data:'];

    if (allowedProtocols.includes(parsedUrl.protocol.toLowerCase())) {
      // Check if it's a data image
      if (parsedUrl.protocol.toLowerCase() === 'data:' && !parsedUrl.pathname.toLowerCase().startsWith('image/')) {
        return undefined;
      }
      return url;
    }

    // Allow relative URLs starting with /
    if (url.startsWith('/')) {
      return url;
    }

    return undefined;
  } catch (e) {
    // If URL parsing fails but it's a relative path starting with /, allow it
    if (url.startsWith('/')) {
      return url;
    }
    return undefined;
  }
}
