# Specification

## Summary
**Goal:** Allow linked partners to view each other's journal entries in read-only mode within the Future Us app.

**Planned changes:**
- Add a backend endpoint that retrieves all journal entry types (daily, emotional, night reflection, growth) for a user's linked partner, enforcing couple-based access control so unlinked users cannot access another user's journal data.
- Add a React Query hook in `useQueries.ts` to fetch the partner's journal entries, active only when the user is in a coupled state, with loading and error state handling.
- Add a "Partner's Journal" tab in `JournalSection.tsx` that is visible only when the user is linked to a partner, displaying all four journal types in read-only mode with date navigation and no edit/save controls, consistent with the existing partner view pattern used in DailyPlanner, WeeklyPlanner, MonthlyPlanner, and VisionBoard.

**User-visible outcome:** Coupled users can switch to a "Partner's Journal" tab in the Journal section to browse their partner's daily, emotional, night reflection, and growth journal entries in read-only mode.
