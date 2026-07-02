## 2025-03-09 - Stored XSS Prevention
**Vulnerability:** User-provided URLs (`pin.source` and `pin.imageUrl`) were used directly in `href` and `window.open` without protocol validation, allowing Stored XSS via `javascript:` URIs.
**Learning:** React does not automatically sanitize `href` or `window.open` arguments against `javascript:` URIs, making it crucial to validate URL protocols before rendering them.
**Prevention:** Always use a custom URL sanitization utility (like `getSafeUrl`) to enforce an allowlist of safe protocols (`http:`, `https:`, etc.) for any user-provided URLs.
