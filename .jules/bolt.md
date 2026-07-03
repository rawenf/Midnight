## 2024-10-24 - Memoize Array Operations in Component Render Paths
**Learning:** The codebase exhibits a pattern of performing expensive synchronous array operations (like sorting and filtering lists) directly in the component render path.
**Action:** Utilize `useMemo` to optimize these operations and prevent main thread blocking during frequent re-renders.
