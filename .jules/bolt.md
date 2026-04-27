## 2024-05-18 - Heavy Filtering Re-renders
**Learning:** Found that heavy sorting and filtering in a functional component without memoization can block the UI thread during unconnected component re-renders (such as modal toggles) in React apps that display complex feeds.
**Action:** Use `useMemo` for derived states performing heavy array operations, especially those combining sorts, string filtering, and intersection logic.
