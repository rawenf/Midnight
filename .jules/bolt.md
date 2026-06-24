## 2024-05-24 - Array Operations Memoization
**Learning:** Found a pattern where expensive synchronous array operations (sorting and filtering large lists like `filteredPins` and `recentPins`) were being performed directly in the component render path of `App.tsx`, causing unnecessary main-thread blocking during frequent state updates (like infinite scrolling or typing).
**Action:** Consistently utilize `useMemo` to memoize array computations that depend on specific state, preventing O(n log n) recalculations on unrelated re-renders.
