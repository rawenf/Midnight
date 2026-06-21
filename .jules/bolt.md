## 2025-02-18 - Missing Memoization on Expensive Array Operations
**Learning:** The codebase exhibits a pattern of performing expensive synchronous array operations (like sorting and filtering lists) directly in the component render path, which can block the main thread during frequent re-renders.
**Action:** Utilize `useMemo` to optimize these operations and prevent main thread blocking, particularly for lists derived from application state (e.g., in `App.tsx`).
