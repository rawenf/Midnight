## 2024-06-25 - Render Path Memoization Optimization
**Learning:** The application exhibits a pattern of performing expensive synchronous array operations (sorting and filtering `realPins` for various views like 'for-you' feed and profile tabs) directly in the component render path of `App.tsx`, causing unnecessary main thread blocking on every re-render.
**Action:** Use `useMemo` to memoize expensive derived state computations based on dependency arrays to ensure calculations only happen when underlying data (e.g. `realPins`, `feedMode`) changes.
