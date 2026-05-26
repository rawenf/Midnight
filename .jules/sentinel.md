## 2024-05-26 - Stored XSS in User-Provided URLs
**Vulnerability:** User-provided URLs (`pin.source`, `pin.imageUrl`) were used directly in `href` attributes and `window.open` calls without validation, creating a Stored XSS vulnerability via `javascript:` URIs.
**Learning:** React does not automatically sanitize `href` attributes against malicious schemes like `javascript:`.
**Prevention:** Always validate and sanitize user-provided URLs using a utility function (like `getSafeUrl`) to enforce safe protocols (e.g., `http:`, `https:`, `mailto:`) before rendering them in `href` attributes or using them in DOM APIs.
