## 2026-05-20 - Expensive Synchronous Operations in App.tsx Render Path
**Learning:** The application performs heavy array operations (filtering and sorting 'realPins') synchronously during every render, which blocks the main thread and causes jank on state updates.
**Action:** Wrap these operations in `useMemo` hooks to memoize the results and only recompute when the underlying dependencies change.
