## 2026-05-22 - Stored XSS in React href
**Vulnerability:** User-provided URLs were directly injected into href attributes and window.open calls.
**Learning:** React does not sanitize href attributes against javascript: URIs, leading to Stored XSS.
**Prevention:** Explicitly validate URLs to ensure they start with safe protocols (http/https) before using them in href or window.open.
