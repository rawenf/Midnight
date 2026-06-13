## 2026-06-13 - Memoize array operations in App.tsx
**Learning:** The App component natively synchronizes and processes large lists of global state items (like pins) using expensive, synchronous sorting and filtering arrays on every render, which blocks the main thread and hurts application responsiveness.
**Action:** Always wrap derived, expensive array operations in `useMemo` to prevent redundant calculations during unrelated component state updates.
