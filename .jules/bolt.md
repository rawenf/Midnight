## 2025-02-26 - [Unmemoized Array Computations]
**Learning:** Found complex arrays processing logic combined in a IIFE directly inside rendering code causing O(N log N) + O(N) operations to run on each re-render whenever the smallest state element updated (e.g. infinite scroll, search query updates).
**Action:** Always check array filters and sorts rendered dynamically during state updates. Memoize using useMemo to reduce computation on trivial re-renders.
