## 2026-05-22 - Expensive Array Operations in Render Path
**Learning:** The codebase exhibited an anti-pattern of performing expensive synchronous array operations (filtering, sorting) directly in the render path, which blocks the main thread during frequent re-renders.
**Action:** Always wrap heavy synchronous data transformations in useMemo to memoize the result based on dependencies.
