## 2026-04-25 - Prevent XSS in user-provided links
**Vulnerability:** Unsanitized `href` attribute in `<a>` tags allowed arbitrary URLs including `javascript:` and `data:`, leading to potential Cross-Site Scripting (XSS).
**Learning:** React does not automatically sanitize `href` attributes.
**Prevention:** Always validate URLs against allowed protocols (e.g., `http://`, `https://`) before passing them to `href` attributes, and use `target="_blank"` with `rel="noopener noreferrer"`.
