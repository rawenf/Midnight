## 2025-03-02 - Prevent Stored XSS from User-Provided URLs
**Vulnerability:** User-provided URLs (`pin.source` and `pin.imageUrl`) were being directly used in `href` attributes and `window.open` calls without sanitization, creating a risk for Stored XSS via malicious protocols like `javascript:`.
**Learning:** React does not automatically sanitize `href` attributes against `javascript:` URIs. It is necessary to explicitly validate and sanitize any URL before rendering it as a link or opening it.
**Prevention:** Always use a secure utility function (like `getSafeUrl` with a strict allowlist of `http://`, `https://`, and `data:image/` protocols) to validate external URLs before using them in the DOM.
