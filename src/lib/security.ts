export function getSafeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;

  // Parse URL to check protocol, fallback to undefined if invalid
  try {
    const parsed = new URL(url, 'http://localhost'); // Provide a dummy base for relative URLs

    // Allow relative URLs that start with /
    if (url.startsWith('/')) return url;

    const protocol = parsed.protocol.toLowerCase();
    const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:', 'data:'];

    if (safeProtocols.includes(protocol)) {
      // For data URIs, only allow images
      if (protocol === 'data:') {
        return url.startsWith('data:image/') ? url : undefined;
      }
      return url;
    }

    return undefined;
  } catch (e) {
    // If URL parsing fails entirely
    return undefined;
  }
}
