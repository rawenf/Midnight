## 2024-05-24 - [Unsanitized URL in anchor tags]
**Vulnerability:** Found a Stored XSS vulnerability where user-controlled `pin.source` was directly injected into the `href` attribute without sanitization, alongside a lack of reverse tabnabbing protection.
**Learning:** External links displaying user data should always sanitize `javascript:`, `vbscript:`, and `data:` schemes, and use `target="_blank"` with `rel="noopener noreferrer"`.
**Prevention:** Build a central URL sanitization utility and apply it consistently across all components rendering external anchor tags.
