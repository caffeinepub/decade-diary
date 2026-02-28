# Specification

## Summary
**Goal:** Display the linked partner's planner entries (yearly, monthly, weekly, and daily) as read-only sections within each corresponding planner page.

**Planned changes:**
- Add backend query functions to fetch a partner's yearly, monthly, weekly, and daily planner entries by principal ID (read-only, accessible only to linked couple partners)
- Add React Query hooks in `useQueries.ts` for each of the four partner planner queries
- Add a "Partner's Plan" tab or section to the YearlyPlanner page showing the partner's word of the year, goals, vision URLs, habit tracker, and reflection
- Add a "Partner's Plan" tab or section to the MonthlyPlanner page showing the partner's goals, important dates, budget, and mood tracker for the selected month
- Add a "Partner's Plan" tab or section to the WeeklyPlanner page showing the partner's priority tasks, habit tracker, todos, energy rating, and reflection for the selected week
- Add a "Partner's Plan" tab or section to the DailyPlanner page showing the partner's schedule, tasks, notes, water intake, mood, gratitude, and journal entry for the selected date
- All partner-view sections are read-only and only visible when a couple relationship is established
- Show a friendly empty state when no partner is linked or the partner has no entry for the selected period

**User-visible outcome:** Users can view their partner's planner entries across all planner pages (yearly, monthly, weekly, daily) in a dedicated read-only section, with navigation (date/week/month/year) applying to both their own and their partner's view simultaneously.
