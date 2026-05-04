## 2025-02-23 - Infinite Scroll Re-render Bottleneck
**Learning:** The App.tsx architecture triggers a full component re-render every time the infinite scroll triggers (which updates `displayCount`). Because large derived arrays (`filteredPins`, `savedPins`, etc.) were not memoized, this caused O(N log N) sorting and filtering on every single scroll update, heavily degrading performance.
**Action:** Always verify if components managing infinite scroll state or frequent UI state changes properly memoize their heavy data derivations using `useMemo`.
