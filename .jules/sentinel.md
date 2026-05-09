## 2025-05-09 - XSS Vulnerability in Pin Detail Links
**Vulnerability:** User-controlled URLs (`pin.source` and `pin.imageUrl`) were used directly in `href` attributes and `window.open` calls without protocol validation, allowing potential XSS via `javascript:` URIs.
**Learning:** React escapes text content but does not protect against malicious URI schemes in attributes like `href` or when passing strings to DOM APIs like `window.open`.
**Prevention:** Always validate external, user-provided URLs to ensure they use safe protocols (e.g., `http://` or `https://`) before rendering them as links or opening them programmatically.
