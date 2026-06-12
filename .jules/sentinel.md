## 2024-06-13 - [Prevent Stored XSS in URL Attributes]
**Vulnerability:** User-provided URLs (pin.source and pin.imageUrl) were used directly in href attributes and window.open calls without protocol validation, allowing potential javascript: URIs (Stored XSS).
**Learning:** React does not automatically sanitize href attributes against malicious protocols. It's crucial to explicitly validate URL protocols against an allowlist before rendering them or using them in DOM APIs.
**Prevention:** Always use a utility like getSafeUrl to validate that URLs start with safe protocols (http:, https:, mailto:, tel:, or safe data: types) or are relative paths before using them in user-facing links.
