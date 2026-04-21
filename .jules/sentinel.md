## 2024-05-24 - XSS in User-Provided External Links
**Vulnerability:** The application blindly accepted the user-provided `pin.source` URL in the `<a href>` attribute, exposing users to a `javascript:` XSS attack vector.
**Learning:** React does not automatically sanitize `<a href="...">` attributes against javascript: URIs. Even if a link points to an external source, it needs explicit protocol validation.
**Prevention:** Always validate that external links begin with `http://` or `https://` before rendering them in an `href` attribute. Additionally, always combine `target="_blank"` with `rel="noopener noreferrer"` to mitigate reverse tabnabbing attacks.
