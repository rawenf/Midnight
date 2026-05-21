## 2024-03-20 - Stored XSS via User-Provided URLs
**Vulnerability:** User-provided URLs (`pin.source` and `pin.imageUrl`) were used directly in `href` and `window.open` calls without sanitization, allowing potential Stored XSS via `javascript:` or `data:` URIs.
**Learning:** React does not automatically sanitize `href` attributes against malicious URI schemes. URLs must be explicitly validated and sanitized before usage.
**Prevention:** Always use a security utility function (like `getSafeUrl`) to validate that user-provided URLs start with safe protocols (`http://` or `https://`) or are valid relative paths before using them in `href` attributes, `window.open`, or similar DOM sinks.
