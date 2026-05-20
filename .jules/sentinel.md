## 2024-05-24 - Stored XSS via user-provided URLs
**Vulnerability:** User-provided URLs (`pin.source` and `pin.imageUrl`) were used directly in `href` attributes and `window.open` calls without validation, allowing potential `javascript:` or `data:` URI XSS attacks.
**Learning:** React does not automatically sanitize `href` attributes against `javascript:` URIs, creating a risk for Stored XSS if the data originates from user input.
**Prevention:** Always explicitly validate that URLs start with safe protocols (like `http://` or `https://`) before using them in components or window interactions. Use the new `getSafeUrl` utility function in `src/lib/security.ts`.
