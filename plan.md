1. **Create Utility for Safe URLs:** Add `src/lib/security.ts` to implement a `getSafeUrl` function that validates user-provided URLs. It will only allow `http://` and `https://` protocols (preventing `javascript:` and other malicious schemes).
2. **Sanitize `href` in `PinDetailView.tsx`:** Update `src/components/PinDetailView.tsx` to use the new `getSafeUrl` function for the `href` attribute in the "View Primary Source" link (`href={getSafeUrl(pin.source)}`).
3. **Sanitize `window.open` in `PinDetailView.tsx`:** Update the fallback download logic in `src/components/PinDetailView.tsx` to sanitize `pin.imageUrl` before passing it to `window.open` (`window.open(getSafeUrl(pin.imageUrl), '_blank')`).
4. **Create/Update Security Journal:** Create `.jules/sentinel.md` and document this Stored XSS vulnerability and its prevention.
5. **Verify Changes:** Run the linter (`npx tsc --noEmit` and/or `npm run build`) to ensure the changes are syntactically correct and don't introduce errors.
6. **Complete pre-commit steps:** Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
7. **Create PR:** Create a pull request to submit these security fixes.
