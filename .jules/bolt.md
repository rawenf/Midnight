## 2026-07-05 - Array operations blocking main thread
**Learning:** The App.tsx component runs several synchronous array operations (filter, sort) on `realPins` directly in the render path, which blocks the main thread on every re-render (e.g. from state changes like `isSyncing` or `displayCount`).
**Action:** Use `useMemo` to memoize derived state operations (filtering/sorting) that are expensive, preventing unnecessary recalculations across re-renders.
