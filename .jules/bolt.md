## 2024-05-18 - Memoizing Array Operations in Render Paths
**Learning:** The codebase exhibits a pattern of performing expensive synchronous array operations (like sorting and filtering lists) directly in the component render path, which blocks the main thread during frequent re-renders.
**Action:** Utilize useMemo to cache the results of expensive array operations to prevent main thread blocking during frequent re-renders.
