## 2026-04-29 - XSS via user-provided links
**Vulnerability:** User-provided link URLs were rendered directly into an `href` attribute without sanitization, allowing `javascript:` payloads.
**Learning:** Even internal links or fields labelled as "source" must be validated as absolute HTTP/HTTPS URLs before being placed in an `href` to prevent XSS.
**Prevention:** Always validate URL schemes (e.g. `startsWith('http://') || startsWith('https://')`) when rendering user-controlled URLs in anchor tags, and use `rel="noopener noreferrer"` for external links.
