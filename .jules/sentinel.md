## 2024-05-24 - Stored XSS via User-Provided URLs
**Vulnerability:** Unsanitized user inputs (e.g., `pin.imageUrl`, `pin.source`) were directly passed to `window.open` and `href` attributes in `PinDetailView.tsx`, allowing potential Stored XSS via `javascript:` URIs.
**Learning:** React does not automatically sanitize `href` attributes against `javascript:` URIs. User-provided URLs must be explicitly validated before use in navigation or opening windows.
**Prevention:** Always use a utility function like `getSafeUrl` to validate URLs against an explicit allowlist of safe protocols (`http:`, `https:`, etc.) before using them in DOM sinks.
