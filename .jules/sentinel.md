## 2024-05-24 - Stored XSS in React URL attributes
**Vulnerability:** User-controlled URLs used directly in href and window.open allowed javascript: URI execution, leading to Stored XSS.
**Learning:** React does not automatically sanitize href attributes against malicious protocols. Any user-provided URL must be explicitly validated.
**Prevention:** Always use the getSafeUrl utility from src/lib/security.ts to strictly allowlist protocols (e.g., http:, https:) before passing URLs to href or window.open.
