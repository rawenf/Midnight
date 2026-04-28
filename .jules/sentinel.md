## 2024-05-19 - [Fix Stored XSS in external links and image downloads]
**Vulnerability:** Found unvalidated URLs being used in  and external anchor `href` tags.
**Learning:** These can be exploited by an attacker submitting a `javascript:` URL that would be executed in the victim's browser context.
**Prevention:** Always validate external URL protocols (http/https) before using them in anchor tags or opening them in a new window. Adding `target="_blank"` and `rel="noopener noreferrer"` also helps prevent reverse tabnabbing attacks.
## 2024-05-19 - [Fix Stored XSS in external links and image downloads]
**Vulnerability:** Found unvalidated URLs being used in `window.open` and external anchor `href` tags.
**Learning:** These can be exploited by an attacker submitting a `javascript:` URL that would be executed in the victim's browser context.
**Prevention:** Always validate external URL protocols (http/https) before using them in anchor tags or opening them in a new window. Adding `target="_blank"` and `rel="noopener noreferrer"` also helps prevent reverse tabnabbing attacks.
