## 2025-06-21 - Stored XSS via User-Provided URLs in React
**Vulnerability:** User-provided URLs (like `pin.source` and `pin.imageUrl`) were used directly in `href` attributes and `window.open` calls without sanitization, allowing potential Stored XSS attacks if a malicious user provided a `javascript:` URI.
**Learning:** React does not automatically sanitize `href` attributes against `javascript:` URIs. It is crucial to manually validate protocols for any user-provided URLs before using them in navigation or external links.
**Prevention:** Always use a utility function like `getSafeUrl` to strictly validate and allowlist URL protocols (e.g., `http:`, `https:`, `mailto:`) before passing them to `href` or `window.open`.
