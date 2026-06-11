## 2024-05-24 - Stored XSS via User-Provided URLs
**Vulnerability:** User-provided URLs (`pin.source`, `pin.imageUrl`) were used directly in `href` and `window.open()` without validation, allowing `javascript:` URIs to execute arbitrary code (Stored XSS).
**Learning:** React does not automatically sanitize `href` attributes or `window.open` calls against malicious URI schemes like `javascript:`.
**Prevention:** Always validate and sanitize user-provided URLs against an allowlist of safe protocols (e.g., `http://`, `https://`) before using them in navigation or links.
