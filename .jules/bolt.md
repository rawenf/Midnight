## 2026-06-06 - Memoize expensive array operations
**Learning:** The application performed expensive synchronous array operations (filtering and sorting lists) directly in the component render path in App.tsx, which can block the main thread during frequent re-renders.
**Action:** Utilize useMemo to memoize these operations, recalculating only when necessary dependencies change to ensure a smooth frame rate.
