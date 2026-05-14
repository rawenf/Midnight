## 2025-03-05 - Expensive Synchronous Arrays
**Learning:** Performing multiple `filter` and `sort` array operations on lists directly in the render path synchronously blocks the main thread and severely hurts performance during high-frequency component re-renders (like intersection observer scroll events or search typing).
**Action:** Always wrap computationally expensive array manipulations in `useMemo` hooks with correct dependency arrays to cache the results and only recalculate when inputs genuinely change.
