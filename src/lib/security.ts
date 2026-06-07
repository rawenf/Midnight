export function getSafeUrl(url: string | undefined | null): string {
  if (!url) return '#';

  try {
    const trimmedUrl = url.trim();
    // Allow relative paths
    if (trimmedUrl.startsWith('/')) return trimmedUrl;

    // Parse URL to check protocol
    const parsedUrl = new URL(trimmedUrl);
    const protocol = parsedUrl.protocol.toLowerCase();

    // Allowlist approach
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:', 'data:'];

    if (allowedProtocols.includes(protocol)) {
      if (protocol === 'data:') {
        // Only allow image data URIs
        if (trimmedUrl.toLowerCase().startsWith('data:image/')) {
           return trimmedUrl;
        }
        return '#';
      }
      return trimmedUrl;
    }
  } catch (e) {
    // If URL parsing fails, and it doesn't start with /, it's invalid
    // Fallback check for javascript: to prevent basic injection if URL constructor throws
    if (url.trim().toLowerCase().startsWith('javascript:')) {
      return '#';
    }
  }

  return '#';
}
