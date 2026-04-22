## 2024-05-24 - Root Component State Updates

**Learning:** `App.tsx` has monolithic state that drives many nested subcomponents (searchQuery, activeCategory, etc.). Updating `searchQuery` via UI input triggers frequent re-renders of the entire `App` component. Because the computed data arrays (`createdPins`, `savedPins`, `recentPins`, `filteredPins`, `visiblePins`) were not memoized, they ran on every single keystroke. This recalculation caused heavy arrays to be sorted and filtered unnecessarily, causing UI lag during typing.
**Action:** Use `useMemo` for derived data arrays in components that house global state and handle frequent user interactions. Always analyze the dependencies of state and limit recalculations when the state is unrelated to the derived data computation.
