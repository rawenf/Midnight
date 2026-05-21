## 2024-05-21 - Memoized Expensive Render Array Operations
**Learning:** The App component was executing expensive synchronous array operations (filtering and sorting lists like filteredPins, createdPins, etc) directly within the render path on every render.
**Action:** Used useMemo to cache the array operations and only re-calculate them when their specific dependencies change.
