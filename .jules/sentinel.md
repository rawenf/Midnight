## 2024-06-04 - Stored XSS in Link and Window Open
**Vulnerability:** User-provided URLs (`pin.source` and `pin.imageUrl`) were placed directly into `href` attributes and `window.open` calls without sanitization, allowing potential Stored XSS via `javascript:` URIs.
**Learning:** React does not sanitize `href` attributes against `javascript:` URIs. A custom validation utility is required to ensure only safe protocols are allowed.
**Prevention:** Always use a case-insensitive allowlist approach to explicitly validate and sanitize user-provided URLs before usage in `href` attributes or `window.open` calls, permitting only safe protocols like `http://`, `https://`, `mailto:`, `tel:`, and `data:image/`.
