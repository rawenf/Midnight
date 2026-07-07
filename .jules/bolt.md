## 2026-07-07 - Memoizing Synchronous Array Operations
**Learning:** The application performs expensive synchronous operations like O(n log n) sorting and O(n) filtering directly in the render path (e.g., `filteredPins`), which blocks the main thread during unrelated state changes like search input or modal toggles.
**Action:** Always wrap derived states requiring heavy iterations in `useMemo` to prevent unnecessary recalculations and maintain 60fps responsiveness.
