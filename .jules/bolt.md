## 2025-02-24 - Expensive synchronous operations on render
**Learning:** The application architecture concentrates a lot of UI state (modals, active tabs) into the root `App.tsx` component, causing frequent re-renders. Combined with synchronous, unmemoized array operations (filtering and sorting pins), this leads to main thread blocking during state updates (e.g. simply opening a modal recalculates the entire pin feed).
**Action:** Use `useMemo` for any heavy array manipulations (filter/sort) inside large global components to prevent redundant computation across unrelated UI state updates.
