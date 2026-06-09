export function getSafeUrl(url?: string): string {
  if (!url) return "#";
  const trimmedUrl = url.trim();

  if (trimmedUrl.startsWith('/')) {
    return trimmedUrl;
  }

  try {
    const parsed = new URL(trimmedUrl);
    const protocol = parsed.protocol.toLowerCase();

    if (['http:', 'https:', 'mailto:', 'tel:'].includes(protocol)) {
      return trimmedUrl;
    }
    if (protocol === 'data:' && trimmedUrl.toLowerCase().startsWith('data:image/')) {
      return trimmedUrl;
    }
  } catch (e) {
    // Fallthrough to return "#" if URL is unparseable
  }

  return "#";
}
