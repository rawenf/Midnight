## 2025-05-15 - React Unsafe href Attribute Stored XSS
**Vulnerability:** External links (`href={pin.source}`) and `window.open` calls were rendering user-provided URLs directly without sanitization, leading to a Stored XSS vulnerability if a user provides a `javascript:` or other malicious pseudo-protocol URI.
**Learning:** React escapes HTML content in text nodes, but it does *not* automatically sanitize `href` or `src` attributes against malicious URI schemes.
**Prevention:** Implement and use a centralized URL sanitization utility (like `getSafeUrl` in `src/lib/security.ts`) that explicitly allows only safe protocols (e.g., `http:`, `https:`, `mailto:`, `data:image/`) or relative paths before passing any user-controlled URL into an attribute or sink.
