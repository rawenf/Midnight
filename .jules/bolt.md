## 2025-03-08 - Use useMemo for array operations
**Learning:** Performing expensive synchronous array operations (like sorting and filtering lists) directly in the component render path causes main thread blocking during frequent re-renders.
**Action:** Utilize useMemo to optimize these operations and prevent main thread blocking during frequent re-renders.
