## 2023-10-27 - [Stored XSS via unvalidated URLs]
**Vulnerability:** User-provided URLs (`pin.source` and `pin.imageUrl`) were used directly in `href` and `window.open` without protocol validation, allowing `javascript:` payloads (Stored XSS).
**Learning:** React does not automatically sanitize `href` attributes against `javascript:` URIs, creating a risk for Stored XSS when user content dictates the link destination.
**Prevention:** Always explicitly validate that URLs start with safe protocols (like `http://` or `https://`) using a utility function before using them in `href` attributes or `window.open` calls.
