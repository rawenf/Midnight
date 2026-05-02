## 2025-02-27 - XSS in External Links
**Vulnerability:** Found unsanitized external link `href` attribute (`pin.source`) and an insecure `window.open` call.
**Learning:** React's `<a href>` is vulnerable to `javascript:` URI XSS if the URL comes from user-supplied data without validation. Also, `window.open` and `target="_blank"` are vulnerable to reverse tabnabbing if `rel="noopener noreferrer"` is omitted.
**Prevention:** Always validate external URLs to ensure they start with `http://` or `https://`. Always use `rel="noopener noreferrer"` with `target="_blank"`. Add `'noopener,noreferrer'` to `window.open` calls.
