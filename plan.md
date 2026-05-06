1. **Analyze the performance bottleneck**:
   - The application has a search bar that updates `searchQuery` state on every keystroke. This causes the entire `App` component to re-render.
   - During this re-render, `MasonryGrid` and all its `PinCard` children re-render. `PinCard` contains images, complex animations, and context subscriptions, making its re-renders expensive.
2. **Implement Performance Optimizations**:
   - Wrap `PinCard` with `React.memo` using a custom comparison function to prevent unnecessary re-renders. The custom comparator will check if the pin ID, selection mode, and selected status are the same.
   - This avoids the need to thread `useCallback` and `useMemo` through the entire component tree for props like `onCardClick` that just call state setters.
3. **Verify Changes**:
   - Run `npx tsc --noEmit` and `npm run build` to verify no TypeScript or build errors were introduced.
4. **Complete Pre-Commit Steps**:
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
5. **Create PR**:
   - Submit the PR with the required Bolt format.
