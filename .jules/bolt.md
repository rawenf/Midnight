## 2024-05-18 - Expensive Synchronous Array Operations
**Learning:** The codebase exhibits a pattern of performing expensive synchronous array operations (like sorting and filtering lists) directly in the component render path (e.g., App.tsx).
**Action:** Utilize useMemo to optimize these operations and prevent main thread blocking during frequent re-renders.
