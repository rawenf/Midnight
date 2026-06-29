## 2024-05-15 - [XSS via Unsanitized URLs]
**Vulnerability:** Stored XSS possible via unvalidated user-provided URLs in pin.source and pin.imageUrl used in href and window.open.
**Learning:** React does not automatically sanitize href attributes against javascript: URIs, making the app vulnerable if user input is directly passed to href.
**Prevention:** Always validate and sanitize user-provided URLs against a strict allowlist of safe protocols (http, https, mailto, etc.) before rendering them in href or opening them.
