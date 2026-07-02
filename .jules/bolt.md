## 2026-07-02 - Array operations in render path
**Learning:** The application performs expensive synchronous array operations (sorting and filtering lists) directly in the component render path.
**Action:** Utilize useMemo to optimize these operations and prevent main thread blocking during frequent re-renders.
