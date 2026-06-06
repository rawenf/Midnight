## 2024-06-07 - Prevent Stored XSS in User-Provided URLs
**Vulnerability:** User-provided URLs (`pin.source`, `pin.imageUrl`) were directly used in `href` and `window.open` without protocol validation, allowing `javascript:` URIs (Stored XSS).
**Learning:** React does not sanitize `href` attributes against `javascript:` URIs, and `window.open` is similarly vulnerable. Protocol allowlisting is required.
**Prevention:** Always use a utility like `getSafeUrl` to validate that URLs start with safe protocols (`http://`, `https://`, etc.) before using them in UI elements or navigation.