## 2024-05-07 - [React Render Bottlenecks]
**Learning:** Found that complex filtering and sorting logic, specifically an O(n log n) sort, was being executed synchronously on every component render in App.tsx. This was unoptimized despite being a core piece of the app's feed functionality.
**Action:** Consistently check top-level component rendering for expensive operations. Utilize `useMemo` specifically on operations like array sorting and multiple string matching during filtering.
