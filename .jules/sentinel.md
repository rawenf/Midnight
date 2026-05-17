## 2024-05-18 - [Stored XSS in user-provided URLs]
**Vulnerability:** Found Stored XSS vulnerability where user-provided `source` URLs were passed directly to `href` attributes and `imageUrl` was passed directly to `window.open`.
**Learning:** React does not automatically sanitize `href` attributes against `javascript:` URIs. It is crucial to always validate user-provided URLs and ensure they use a safe protocol (http/https).
**Prevention:** Implement a strict URL validation utility (e.g. `getSafeUrl`) to enforce safe protocols and sanitize all user-provided URLs before rendering them as links or passing them to navigation functions.
