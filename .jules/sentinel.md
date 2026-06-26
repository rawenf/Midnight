## 2024-03-01 - Stored XSS via Unsanitized User URLs
**Vulnerability:** User-provided URLs (`pin.source`, `pin.imageUrl`) were used directly in `href` attributes and `window.open()`, allowing potential Stored XSS via `javascript:` URIs.
**Learning:** React does not automatically sanitize `href` attributes against `javascript:` protocols. Any user-controllable URL must be validated before insertion.
**Prevention:** Implemented and applied `getSafeUrl` utility across the codebase to strictly enforce an allowlist of safe protocols (`http:`, `https:`, etc.) for all dynamic URLs.
