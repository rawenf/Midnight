## 2025-05-10 - User Controlled External Links
**Vulnerability:** User-controlled external link fields (`pin.source` and `pin.imageUrl`) were injected directly into `<a href>` and `window.open` respectively, allowing `javascript:` URIs to execute arbitrary code (XSS).
**Learning:** React escapes content but does not protect against XSS when unsanitized URIs are provided to attributes like `href` or to functions like `window.open()`. In user generated content contexts, fields like `source` often contain malicious URIs.
**Prevention:** Always validate external links to ensure they use allowed protocols (e.g. `http://` or `https://`) before rendering them in `href` attributes or using them in navigation APIs. Also use `target="_blank"` with `rel="noopener noreferrer"`.
