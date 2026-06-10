## 2025-02-28 - Expensive render cycle operations
**Learning:** Found a pattern of performing expensive synchronous array operations (sorting and filtering `realPins` multiple times) directly in the component render path in `src/App.tsx`.
**Action:** Wrap such synchronous, heavy array computations with `useMemo` to avoid blocking the main thread during frequent re-renders.