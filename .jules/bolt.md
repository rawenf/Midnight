## 2026-04-30 - Memoization of Core Feed Data
**Learning:** The main feed components frequently recalculated heavy derived states involving O(N log N) sorting operations (specifically for user feed customization and fallback sorting), causing re-render performance bottlenecks when components remount or unrelated state changes occur.
**Action:** Always verify if complex derived list filtering and sorting in React top-level components can be optimized with `useMemo` hooks using appropriate dependency arrays.
