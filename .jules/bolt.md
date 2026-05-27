## 2026-05-27 - Expensive Synchronous Array Operations in Render Path
**Learning:** The codebase exhibited a pattern of performing expensive synchronous array operations (like sorting and filtering large lists) directly in the component render path without memoization, blocking the main thread during frequent re-renders.
**Action:** Utilize useMemo to optimize expensive array operations and prevent main thread blocking, ensuring calculations are only run when dependencies change.
