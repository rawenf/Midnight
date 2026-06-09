## 2024-06-10 - Stored XSS via unsanitized URLs
**Vulnerability:** User-provided URLs (`pin.source` and `pin.imageUrl`) were directly rendered in `href` attributes and `window.open` calls without protocol validation, allowing Stored XSS via `javascript:` URIs.
**Learning:** React does not inherently sanitize `href` attributes against malicious protocols. Any user-provided URL must be explicitly validated.
**Prevention:** Always use a case-insensitive allowlist utility (like `getSafeUrl`) to enforce safe protocols (`http:`, `https:`, etc.) before passing user input to `href` or `window.open`.
