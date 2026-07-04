## 2025-05-18 - Memoize Expensive Array Operations in App.tsx
**Learning:** The application was performing synchronous array operations (`sort`, `filter`) on large lists (`realPins`) directly in the main component render loop. This can block the main thread and degrade performance as the number of pins increases.
**Action:** Wrap these operations (`filteredPins`, `createdPins`, `savedPins`, `recentPins`) with `useMemo` to cache the results and only recompute when the underlying dependencies change, optimizing render performance.
