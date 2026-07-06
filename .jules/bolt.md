## 2025-02-27 - Memoize Expensive Array Operations in Render
**Learning:** Performing expensive synchronous array operations (like sorting and filtering large lists) directly in the component render path causes main thread blocking during frequent re-renders (such as typing in a search bar).
**Action:** Always utilize `useMemo` to cache the results of expensive operations in React components, preventing unnecessary recalculations when dependencies haven't changed.
