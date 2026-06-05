## 2025-03-08 - Stored XSS via User-Provided URLs
**Vulnerability:** User-provided URLs (like pin.source or pin.imageUrl) were used directly in `href` attributes and `window.open` calls without protocol validation, allowing potential XSS via `javascript:` URIs.
**Learning:** React does not automatically sanitize `href` attributes against malicious protocols. Unvalidated URLs in these contexts represent a Stored XSS vector.
**Prevention:** Always validate and sanitize user-provided URLs against a strict protocol allowlist (http://, https://, etc.) before using them in DOM sinks like `href` or `window.open`.
