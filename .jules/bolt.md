## 2024-05-24 - Expensive Synchronous Array Operations
**Learning:** The codebase performs expensive synchronous array operations (sorting/filtering lists) directly in the component render path, which can block the main thread during frequent re-renders.
**Action:** Use `useMemo` to cache the results of expensive computations like filtering and sorting, ensuring they only re-run when their dependencies change.
