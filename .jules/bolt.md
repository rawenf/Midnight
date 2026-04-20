## 2026-04-20 - Array filtering memoization in React component
**Learning:** In a highly interactive React application with large sets of arrays derived from state (e.g., `createdPins`, `savedPins`, `recentPins`, `filteredPins`), re-rendering recalculates them unnecessarily if not memoized, which can be a significant performance bottleneck.
**Action:** Use `useMemo` with appropriate dependency arrays to avoid unneeded filtering and sorting operations on each render.
