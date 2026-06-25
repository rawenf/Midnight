## 2024-06-25 - XSS Vulnerability in Pin Source Links
**Vulnerability:** The application was directly using user-provided `pin.source` in `href` attributes in `PinDetailView.tsx`.
**Learning:** React does not automatically sanitize `href` attributes. A malicious user could provide a `javascript:` URL, leading to Stored XSS when another user clicks the link.
**Prevention:** Always validate and sanitize user-provided URLs before using them in `href` attributes. A `getSafeUrl` utility function was created to ensure only safe protocols (`http:`, `https:`, etc.) are allowed.
