## 2026-05-08 - XSS via user-controlled URL in href
**Vulnerability:** A stored XSS vulnerability in the `PinDetailView` component where a user-controlled `pin.source` could be a malicious `javascript:` or `data:` URI.
**Learning:** React does not prevent XSS in `href` attributes. User input that will be used as a URL must be validated for safe schemes before rendering.
**Prevention:** Always validate user-provided URLs by ensuring they start with `http://` or `https://` and add `target="_blank" rel="noopener noreferrer"` for external links.
