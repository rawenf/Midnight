## 2024-05-15 - Unoptimized Render Loop
**Learning:** `App.tsx` performs complex array sorts and filters synchronously in the main render body on every re-render. This causes performance issues as the data set grows.
**Action:** Use `useMemo` to memoize the results of these operations so they only re-run when their specific dependencies (`realPins`, `feedMode`, `user`, etc.) change.
