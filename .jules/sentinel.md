## 2026-05-27 - Prevent Stored XSS in URL handling
**Vulnerability:** React does not sanitize `href` attributes or `window.open` targets against `javascript:` URIs, leading to potential Stored XSS if user-provided URLs (like pin.source or pin.imageUrl) are used directly.
**Learning:** Explicit validation of URL protocols (allowing only `http:`, `https:`, or relative paths) is required for user-provided links to prevent malicious script execution.
**Prevention:** Always use a utility like `getSafeUrl` to validate and sanitize user-provided URLs before using them in `href` attributes or `window.open` calls.
