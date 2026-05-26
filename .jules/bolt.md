## 2024-05-24 - Memoizing Synchronous Array Operations
**Learning:** The codebase performed expensive synchronous operations (filtering and sorting lists of pins) directly in the component render path, which blocks the main thread and causes UI jank on re-renders.
**Action:** Used `useMemo` to cache the results of `createdPins`, `savedPins`, `recentPins`, `filteredPins`, and `visiblePins` so they only recalculate when their specific dependencies (like `realPins`, `user`, or search filters) change.
