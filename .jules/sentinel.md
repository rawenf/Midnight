## 2024-06-22 - [XSS vulnerability via untrusted URLs]
**Vulnerability:** Untrusted user input (`pin.source` and `pin.imageUrl`) is passed directly to `href` attributes and `window.open` calls.
**Learning:** React does not automatically sanitize `href` attributes against `javascript:` URIs, creating a risk for Stored XSS.
**Prevention:** Always validate and sanitize user-provided URLs using `getSafeUrl` before using them in `href` attributes or `window.open` calls.
