export const getSafeUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;

  // Define allowed protocols
  const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:', 'data:'];

  try {
    const parsedUrl = new URL(url);
    if (allowedProtocols.includes(parsedUrl.protocol)) {
      return url;
    }
    return '#'; // Fallback for invalid protocols
  } catch (e) {
    // If URL parsing fails, check if it's a relative URL or valid fragment
    if (url.startsWith('/') || url.startsWith('#')) {
      return url;
    }
    return '#';
  }
};
