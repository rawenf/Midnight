## 2026-06-03 - Expensive Array Operations in Render Loop
**Learning:** The App component performs several expensive synchronous array operations (filtering and sorting lists of pins) directly in the render path. For example, `createdPins`, `savedPins`, `recentPins`, and `filteredPins` are calculated every render, causing performance degradation when the pins list is large.
**Action:** Wrap these expensive array calculations inside `useMemo` hooks. This is specifically listed as a known pattern in the memory instructions.
