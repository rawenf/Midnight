export function getSafeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;

  const trimmedUrl = url.trim();
  if (!trimmedUrl) return undefined;

  try {
    const parsedUrl = new URL(trimmedUrl);
    // Only allow http and https protocols to prevent javascript: XSS
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      return parsedUrl.toString();
    }
    return undefined;
  } catch (e) {
    // If it's a relative URL, allow paths starting with '/' or '#'
    if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('#')) {
      return trimmedUrl;
    }
    return undefined;
  }
}
