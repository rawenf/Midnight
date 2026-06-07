## 2024-06-07 - React XSS in URLs
**Vulnerability:** User-provided URLs mapped directly to `href` attributes and `window.open` can cause XSS via `javascript:` URIs.
**Learning:** React doesn't automatically protect against `javascript:` URIs in `href` properties.
**Prevention:** Always wrap user-provided URLs with an allowlist-based protocol sanitizer like `getSafeUrl` before passing them to the DOM.
