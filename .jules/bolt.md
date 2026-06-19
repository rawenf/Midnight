## 2024-05-18 - Expensive Synchronous Array Operations in Render Path
**Learning:** The codebase exhibits an anti-pattern of performing expensive synchronous array operations (like sorting and filtering large lists of pins) directly in the component render path of `App.tsx`, which blocks the main thread during frequent re-renders.
**Action:** Always wrap these expensive array operations in `useMemo` to ensure they are only recalculated when their specific dependencies change.
