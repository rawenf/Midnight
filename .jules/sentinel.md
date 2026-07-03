## 2025-03-04 - Fix XSS via URL scheme injection
**Vulnerability:** Unsanitized URLs used in href and window.open could allow Stored XSS via javascript: URIs.
**Learning:** React does not sanitize href against javascript: URIs, creating XSS risks when user input is used as a URL.
**Prevention:** Always use getSafeUrl to enforce safe protocols (http, https, etc.) on all dynamically constructed URLs.
