## 2026-06-24 - Stored XSS Prevention in React URLs
**Vulnerability:** User-provided URLs used in window.open() and href attributes could contain malicious javascript: URIs leading to Stored XSS.
**Learning:** React does not automatically sanitize href attributes against javascript: URIs. Explicit URL validation is required before using user input in navigational contexts.
**Prevention:** Always use a case-insensitive URL parsing and allowlist approach (like getSafeUrl) to permit only safe protocols (http, https, mailto, tel, data) and reject javascript: or unknown protocols.
