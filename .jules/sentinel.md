## 2025-05-19 - Stored XSS in React Href Attributes
**Vulnerability:** React does not automatically sanitize `href` attributes against `javascript:` URIs, allowing Stored XSS if user-provided URLs are used directly. This was found in `PinDetailView.tsx` with `pin.source` and `pin.imageUrl`.
**Learning:** Even modern frameworks like React can have XSS vectors if standard attributes like `href` or APIs like `window.open` are given unfiltered user data containing malicious protocols.
**Prevention:** Always validate and sanitize user-provided URLs by ensuring they start with safe protocols (e.g., `http:`, `https:`) before passing them to `href` attributes or `window.open` calls. A reusable utility like `getSafeUrl` helps enforce this pattern.
