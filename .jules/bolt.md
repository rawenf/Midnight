## 2024-06-17 - React Main Thread Blocking Anti-Pattern
**Learning:** Found a common performance anti-pattern where complex array operations (sorting, mapping, filtering lists like realPins) were executed synchronously directly in the render path. Given the frequent state updates (e.g. displayCount via intersection observer), this blocks the main thread on every re-render and degrades interaction smoothness.
**Action:** Always wrap expensive synchronous array derivations in React components with useMemo hooks to ensure they are only re-evaluated when dependencies change.
