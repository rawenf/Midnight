## 2024-05-24 - Unsanitized User-Provided URLs
**Vulnerability:** Found unsanitized user-provided URLs used directly in `href` attributes (e.g., `pin.source`) and `window.open` calls (e.g., `pin.imageUrl`), which creates a risk for Stored XSS if a user provides a `javascript:` URL.
**Learning:** React does not automatically sanitize `href` attributes against `javascript:` URIs. It is critical to validate URL protocols before rendering them or using them in navigation functions.
**Prevention:** Always use a utility function to validate and sanitize URLs against a strict allowlist of safe protocols (`http:`, `https:`, etc.) before using them in DOM elements or browser APIs.
