## 2025-05-31 - Stored XSS via User-Provided URLs
**Vulnerability:** User-provided URLs (pin.source and pin.imageUrl) were used directly in `href` and `window.open` without sanitization, creating a Stored XSS risk via `javascript:` URIs.
**Learning:** React does not sanitize `href` attributes against `javascript:` URIs by default.
**Prevention:** Always use a strict allowlist approach (e.g., `getSafeUrl`) to validate URLs before using them in DOM sinks like `href` or `window.open`.
