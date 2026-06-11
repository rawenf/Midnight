## 2024-06-12 - Memoize expensive synchronous array operations
**Learning:** The App component was executing heavy synchronous array operations (filtering and sorting pins) directly within the render path. This blocked the main thread and degraded UI responsiveness during frequent state updates like searching.
**Action:** Always utilize React.useMemo() for expensive calculations derived from state, especially array sorts/filters on large collections like pins.
