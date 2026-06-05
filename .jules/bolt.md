## 2026-06-05 - Memoize Expensive Array Operations in App.tsx
**Learning:** The application manages global state natively in App.tsx using Firebase onSnapshot listeners, causing frequent re-renders. Synchronous array operations like filtering/sorting large lists directly in the render path cause severe main thread blocking.
**Action:** Always wrap array filtering and sorting in `useMemo` to prevent redundant calculations during unrelated state updates (e.g., opening modals).
