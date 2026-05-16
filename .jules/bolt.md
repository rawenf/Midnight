## 2026-05-16 - Avoiding synchronous array operations in render path
**Learning:** The codebase exhibits a pattern of performing expensive synchronous array operations (like sorting and filtering lists) directly in the component render path (e.g., App.tsx). This can block the main thread and cause UI stuttering during frequent re-renders.
**Action:** Always utilize useMemo to optimize these operations, ensuring they only recalculate when their specific dependencies change.
