## 2026-06-15 - Memoizing Expensive Array Operations
**Learning:** The codebase exhibits a pattern of performing expensive synchronous array operations (like sorting and filtering lists) directly in the component render path, which blocks the main thread during frequent re-renders like infinite scrolling.
**Action:** Utilize useMemo to optimize these operations and prevent main thread blocking during frequent re-renders.
