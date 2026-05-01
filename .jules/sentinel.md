## 2026-05-01 - XSS in User-Provided URLs
**Vulnerability:** Unsanitized `pin.source` and `pin.imageUrl` rendered in `href` and `window.open`
**Learning:** External links stored in the database can carry `javascript:` payloads. React does not automatically sanitize `href` strings.
**Prevention:** Always validate external URL protocols before rendering them in an `<a>` tag or passing them to `window.open()`.
