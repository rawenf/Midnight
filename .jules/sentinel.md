## 2024-05-24 - Stored XSS via User-Provided URLs
**Vulnerability:** User-provided URLs (`pin.source` and `pin.imageUrl`) were used directly in `href` and `window.open` without sanitization, allowing Stored XSS via `javascript:` URIs.
**Learning:** React does not automatically sanitize `href` attributes against `javascript:` URIs. Custom URL validation is necessary for any user-provided links.
**Prevention:** Always validate and sanitize user-provided URLs against a strict allowlist (e.g., `http://`, `https://`, `data:image/`, or relative paths) before rendering them in the DOM.
