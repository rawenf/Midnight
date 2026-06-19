## 2026-06-19 - Prevent Stored XSS via URL Sanitization
**Vulnerability:** User-provided URLs (like source links and image URLs) were used directly in `href` and `window.open` without protocol validation, allowing potential execution of `javascript:` URIs.
**Learning:** React does not automatically sanitize `href` attributes. User inputs used in navigational attributes must be strictly validated against an allowlist of safe protocols to prevent Stored XSS.
**Prevention:** Always use a utility function like `getSafeUrl` to validate URL protocols (allowing only http, https, mailto, tel, data:image, or relative paths) before rendering them in anchor tags or opening them via window.open.
