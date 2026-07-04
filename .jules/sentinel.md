## 2024-07-04 - Stored XSS via javascript: URIs in React
**Vulnerability:** Unsanitized user-provided URLs in `href` attributes and `window.open` calls allowed Stored XSS via `javascript:` URIs.
**Learning:** React does not automatically sanitize `href` attributes against `javascript:` URIs.
**Prevention:** Always validate and sanitize user-provided URLs using a strict allowlist (like the `getSafeUrl` utility) before passing them to `href` or `window.open`.
