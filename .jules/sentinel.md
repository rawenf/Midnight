## 2024-06-20 - Prevent Stored XSS in URLs
**Vulnerability:** `href` and `window.open` were vulnerable to `javascript:` URI execution via unsanitized user-provided URLs.
**Learning:** React does not automatically sanitize `href` attributes against malicious URI schemes like `javascript:`.
**Prevention:** Use a dedicated utility (`getSafeUrl`) to enforce an allowlist of safe protocols (`http:`, `https:`, etc.) for all user-provided URLs.
