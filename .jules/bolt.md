## 2025-03-09 - Main Thread Blocking in React Rendering
**Learning:** Performing expensive array operations like sort and filter directly in the component body of a frequently rendering component blocks the main thread, leading to poor performance.
**Action:** Always wrap heavy synchronous array derivations in useMemo to prevent unnecessary main thread blocking during re-renders.
