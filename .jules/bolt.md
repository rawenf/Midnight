## 2024-05-24 - Memoize expensive array operations in App component
**Learning:** The codebase exhibits a pattern of performing expensive synchronous array operations (like sorting and filtering lists) directly in the component render path (e.g. `App.tsx`), blocking the main thread during frequent re-renders.
**Action:** Utilize `useMemo` to optimize these operations and prevent main thread blocking, ensuring they only recalculate when their dependencies change.
