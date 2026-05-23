## 2024-05-23 - Stored XSS via Unsanitized User-Provided URLs in React
**Vulnerability:** User-provided URLs (like `pin.imageUrl` and `pin.source`) were directly used in `href` attributes and `window.open` calls without validation.
**Learning:** React does not sanitize `href` attributes against `javascript:` URIs. If a user provides a URL starting with `javascript:`, clicking the link will execute arbitrary JavaScript code (Stored XSS).
**Prevention:** Always validate and sanitize user-provided URLs before using them in contexts like `href` or `window.open`. Create and use a utility like `getSafeUrl` to ensure URLs strictly use safe protocols (e.g., `http:`, `https:`).
