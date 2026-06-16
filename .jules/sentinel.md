## 2025-02-27 - Stored XSS via Unsanitized URLs in React
**Vulnerability:** React does not automatically sanitize `href` attributes against `javascript:` URIs, and user-provided URLs were passed directly to `window.open` and `href` attributes, allowing Stored XSS.
**Learning:** URL protocol checks must be explicitly performed before rendering user-provided URLs in `href` attributes or using them in navigation APIs.
**Prevention:** Always validate and sanitize user-provided URLs using an explicit allowlist approach (e.g., a utility function like `getSafeUrl`) to ensure they use safe protocols (`http:`, `https:`, etc.) before using them in the DOM.
