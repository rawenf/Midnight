export function getSafeUrl(url: string | undefined | null): string {
  if (!url) return '#';

  // A simple allowlist for safe protocols/paths
  const safeProtocols = ['http://', 'https://', 'mailto:', 'tel:', 'data:image/'];
  const isSafe = safeProtocols.some(protocol => url.toLowerCase().startsWith(protocol)) || url.startsWith('/') || url === '#';

  if (isSafe) {
    return url;
  }

  console.warn(`[Security] Blocked unsafe URL: ${url}`);
  return '#';
}
