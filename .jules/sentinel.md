## 2024-06-24 - Prevent Stored XSS via User-Provided URLs
**Vulnerability:** User-provided URLs (like `pin.source` and `pin.imageUrl`) were used directly in `href` attributes and `window.open` calls without protocol sanitization, leading to Stored XSS if a payload like `javascript:alert(1)` was injected.
**Learning:** React does not inherently protect against `javascript:` URIs in `href` attributes. A manual protocol check is required before rendering external URLs or passing them to DOM APIs.
**Prevention:** Always wrap user-provided URLs in `getSafeUrl()` from `src/lib/security.ts` to strictly validate allowed protocols (http, https, mailto, tel, data:image) and block dangerous URIs.
