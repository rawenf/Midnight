## 2024-07-05 - Fix Stored XSS in external links
**Vulnerability:** User-provided URLs in 'pin.imageUrl' and 'pin.source' were directly used in 'window.open' and 'href' without protocol sanitization.
**Learning:** React doesn't prevent javascript: URIs in href attributes, allowing stored XSS.
**Prevention:** Use a centralized allowlist approach for URL protocols (e.g., getSafeUrl) before trusting user input in links and external redirects.
