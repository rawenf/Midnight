## 2025-06-09 - Memoize App Array Filtering
**Learning:** Frequent React state updates for UI interactions like modals and dropdowns trigger expensive synchronous array sorting and filtering algorithms on global list states in App.tsx.
**Action:** Use `useMemo` on computationally heavy array derivation logic to prevent main thread blocking during non-related renders.
