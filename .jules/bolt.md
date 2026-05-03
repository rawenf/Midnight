## 2024-05-03 - [Missing Memoization in Heavy Main Feed Render]
**Learning:** React App.tsx main feed had expensive array operations like sorts and filters (including nested array loops) that ran on every render, which could cause massive jank on large datasets.
**Action:** Always wrap derived datasets like filtered, sorted arrays using `useMemo` to only recalculate when dependencies change. Avoid anonymous arrow functions assigning to variables on root render without useMemo.
