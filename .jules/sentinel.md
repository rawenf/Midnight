## 2024-05-24 - Stored XSS in User-Provided URLs
**Vulnerability:** User-provided URLs were being passed directly to href attributes and window.open() without sanitization.
**Learning:** React does not automatically sanitize href attributes against malicious protocols like javascript:.
**Prevention:** Always validate and sanitize user-provided URLs using a strict allowlist approach before using them in DOM attributes or APIs.
