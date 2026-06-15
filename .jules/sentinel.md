## 2024-05-24 - React href XSS Vulnerability
**Vulnerability:** User-provided URLs were directly passed to `href` attributes and `window.open` calls without protocol validation, allowing Stored XSS via `javascript:` URIs.
**Learning:** React does not automatically sanitize `href` attributes against malicious protocols. Unsanitized user inputs in links are a significant vector for XSS.
**Prevention:** Always use a utility like `getSafeUrl` to validate URL protocols against a strict allowlist (`http`, `https`, etc.) before using them in anchor tags or window operations.
