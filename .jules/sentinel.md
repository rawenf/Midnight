## 2024-05-24 - React href Stored XSS Vulnerability
**Vulnerability:** User-provided URLs were directly injected into `href` and `window.open` without sanitization.
**Learning:** React does not automatically sanitize `href` attributes against `javascript:` URIs, creating a Stored XSS vulnerability when rendering user-submitted content.
**Prevention:** Always validate and sanitize URLs using a utility like `getSafeUrl` before using them in `href` attributes or `window.open` calls to ensure they use safe protocols like `http://` or `https://`.
