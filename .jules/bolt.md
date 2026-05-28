## 2024-05-28 - Expensive Synchronous Array Operations in Render Path
**Learning:** Performing multiple expensive synchronous array operations (filtering and sorting lists) directly within the component render path causes main thread blocking during frequent React re-renders.
**Action:** Always wrap expensive data transformations in `useMemo` hooks to cache the result across renders.
