## 2026-05-06 - Unsanitized Third-Party URLs
**Vulnerability:** External links (`href`) and programmatic popups (`window.open`) did not validate URL protocols before execution.
**Learning:** React escapes HTML by default, but it does *not* sanitize URLs. Setting `href` or `window.open` arguments directly to untrusted input can easily lead to Cross-Site Scripting (XSS) via `javascript:alert(1)` URIs.
**Prevention:** Always ensure user-provided or API-sourced URLs begin explicitly with `http://` or `https://` before rendering them into `href` or passing them to navigation functions like `window.open`. Always append `rel="noopener noreferrer"` for external tabs.
