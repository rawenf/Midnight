
## 2024-05-24 - Fix Stored XSS vulnerability in URL handling
**Vulnerability:** User-provided URLs (pin.imageUrl and pin.source) were used directly in `href` and `window.open` without sanitization, creating a Stored XSS vulnerability via `javascript:` URIs.
**Learning:** React does not automatically sanitize `href` attributes against `javascript:` URIs.
**Prevention:** Always validate and sanitize user-provided URLs to ensure they use safe protocols (http/https) before rendering them in DOM or opening them.
