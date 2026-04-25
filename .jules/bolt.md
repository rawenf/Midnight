## 2025-02-18 - Client-side Filtering of Realtime Firebase Collections
**Learning:** The app streams real-time data from Firestore to `realPins` and applies custom feed generation logic ("For You" sort priorities) entirely client-side on every render, which previously caused an O(N*M) sorting issue.
**Action:** When implementing custom client-side feed generation over synced Firestore collections, ALWAYS memoize the derivation and convert array-based relational lookups (like `followingIds`) into Sets before sorting to preserve UI thread performance.
