export function getSafeUrl(url?: string | null): string {
  if (!url) return "#";

  // Allow safe hash links or relative paths
  if (url === '#' || url.startsWith('/')) {
    return url;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return url;
    }
    // Block javascript:, data:, vbscript:, etc.
    return "#";
  } catch (e) {
    // If URL parsing fails and it didn't match safe relative prefixes, default to #
    return "#";
  }
}
