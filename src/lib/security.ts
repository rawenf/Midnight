/**
 * Validates and sanitizes user-provided URLs to prevent Stored XSS vulnerabilities.
 * Ensures the URL uses a safe protocol (http/https).
 */
export function getSafeUrl(url: string | undefined | null, fallback: string = '#'): string {
  if (!url) return fallback;

  try {
    // This will throw if the URL is invalid or relative (without a base)
    // If we want to allow relative URLs, we would need to handle them differently.
    // For source URLs and external links, they should be absolute.
    const parsedUrl = new URL(url, window.location.origin);

    // Only allow safe protocols
    const safeProtocols = ['http:', 'https:'];
    if (safeProtocols.includes(parsedUrl.protocol)) {
      return parsedUrl.href;
    }

    // If it's a known safe protocol but not http/https (e.g. mailto:), we might allow it depending on requirements.
    // For now, strict http/https is safest for external links.
    console.warn(`[Security] Blocked unsafe URL protocol: ${parsedUrl.protocol}`);
    return fallback;
  } catch (error) {
    // If URL parsing fails, it might be a relative path like "/about"
    // Or it might be a malicious string like "javascript:alert(1)"
    // We treat all unparseable URLs as unsafe for external links.
    console.warn(`[Security] Blocked invalid URL: ${url}`);
    return fallback;
  }
}
