## 2024-05-18 - [Preventing XSS and Reverse Tabnabbing]
**Vulnerability:** [XSS vulnerability in user-provided URLs and potential Reverse Tabnabbing via external links]
**Learning:** [User-provided URLs (like source links) can contain malicious protocols like `javascript:` which can execute code when clicked. Opening external links without `rel="noopener noreferrer"` can allow the opened page to hijack the original window.]
**Prevention:** [Always sanitize URLs to ensure they use safe protocols (`http`/`https`) before assigning them to `href` attributes or `window.open`. Always add `rel="noopener noreferrer"` when opening external links in a new tab.]
