## 2024-06-08 - Stored XSS via Unsanitized React href attributes
**Vulnerability:** User-provided URLs (`pin.source` and `pin.imageUrl`) were being passed directly to `href` attributes and `window.open()` calls in `PinDetailView.tsx` without validation, allowing for potential `javascript:` URI Stored XSS attacks.
**Learning:** React does not automatically sanitize `href` attributes against `javascript:` URIs. Any user-controlled URL input must be explicitly validated against an allowlist of safe protocols before being rendered or opened.
**Prevention:** Always use a utility function (like `getSafeUrl`) to enforce a case-insensitive allowlist of secure protocols (`http://`, `https://`, `mailto:`, `tel:`, `data:image/`, or paths starting with `/`) for any dynamic URL source.
