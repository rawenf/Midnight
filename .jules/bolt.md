## 2024-06-08 - Avoid Expensive Synchronous Array Operations in Render Path
**Learning:** Found an anti-pattern in `App.tsx` where expensive operations like filtering and sorting large arrays (`realPins`) were happening synchronously in the component's main render path on every re-render.
**Action:** Always use `useMemo` to memoize expensive array operations that rely on external props or state to prevent blocking the main thread during frequent re-renders.
