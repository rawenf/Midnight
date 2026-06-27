## 2025-02-28 - Expensive synchronous array operations in render path
**Learning:** The codebase exhibits a pattern of performing expensive synchronous array operations (like sorting and filtering lists) directly in the component render path, which blocks the main thread during frequent re-renders.
**Action:** Utilize `useMemo` to optimize these operations and prevent main thread blocking during frequent re-renders.
