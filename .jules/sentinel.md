## 2024-06-13 - [HIGH] Stored XSS via Unvalidated URL Attributes

**Vulnerability:** User-provided URLs for images and external sources were directly injected into `href` and `window.open` calls without protocol validation, allowing for Stored XSS via `javascript:` URIs.
**Learning:** React does not automatically sanitize `href` attributes against malicious protocols. Any user-provided URL must be strictly validated against an allowlist of safe protocols (http, https, mailto, etc.) before being rendered in the DOM or passed to browser navigation APIs.
**Prevention:** Always use the `getSafeUrl` utility function from `src/lib/security.ts` to explicitly validate and sanitize all user-supplied URLs prior to usage in anchor tags or window manipulation methods.