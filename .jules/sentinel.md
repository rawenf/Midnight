
## 2024-06-03 - Stored XSS via User-Provided URLs
**Vulnerability:** Found `href` and `window.open` sinks using user-controlled `pin.source` and `pin.imageUrl` without sanitization.
**Learning:** React does not automatically sanitize `href` attributes against `javascript:` URIs. Relying solely on React's built-in escaping is insufficient for URL properties.
**Prevention:** Always validate and sanitize user-provided URLs using a strict allowlist of safe protocols (e.g., `http://`, `https://`) before passing them to anchor tags or window methods. Ensure protocol checks are case-insensitive.
