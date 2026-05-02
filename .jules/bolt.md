## 2026-05-02 - Array processing in App.tsx
**Learning:** Large React components often recompute derived state like arrays (filter, sort) on every render unnecessarily.
**Action:** Use `useMemo` to wrap derived arrays, specially when arrays can be large or computations like filter/sort are involved.
