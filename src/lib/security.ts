export function getSafeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('/')) return url;

  try {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol.toLowerCase();

    if (['http:', 'https:', 'mailto:', 'tel:'].includes(protocol)) {
      return url;
    }

    if (protocol === 'data:' && url.toLowerCase().startsWith('data:image/')) {
      return url;
    }
  } catch (e) {
    // Parsing error
  }

  return undefined;
}
