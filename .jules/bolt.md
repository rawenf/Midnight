## 2024-03-08 - Synchronous Array Operations in Render
**Learning:** Found expensive array filtering and sorting (`createdPins`, `savedPins`, `recentPins`, `filteredPins`) running directly in the render path.
**Action:** Use `useMemo` to cache these calculations and prevent blocking the main thread during component re-renders.
