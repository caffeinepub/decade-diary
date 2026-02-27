# Specification

## Summary
**Goal:** Build "Decade Diary" Phase 1 — a personal and couples life-planning app with a Home Dashboard, 10-Year Vision Board, Daily Planner, and Couples Collaboration, using a warm editorial aesthetic.

**Planned changes:**

### Backend
- Data model for `User` and `Couple` entities; a couple links two principals and grants shared read/write access to all planner data
- CRUD for 10-Year Vision Board goals with fields: category (7 options), target year, milestones list, "why this matters" note, and progress percentage (0–100)
- CRUD for Daily Planner entries keyed by date, with fields: schedule timeline (time blocks), top 3 tasks with completion status, notes, water intake count, mood emoji, 3 gratitude entries, and mini journal text
- Daily motivational quote query function rotating through 30+ hardcoded quotes keyed by day-of-year
- Couple invite/accept/decline/disconnect functions using principal IDs

### Frontend
- **Home Dashboard** (default screen): motivational quote banner, Today's Focus (top 3 tasks), This Week summary, This Month goal/task counts, 10-Year Vision Progress cards per category with progress bars, and a Quick Journal Entry button
- **10-Year Vision Board page**: goals grouped by category, goal cards with progress slider, inline milestone editing, add/edit/delete via modal form with confirmation on delete
- **Daily Planner page**: date picker defaulting to today, schedule timeline, top 3 task checkboxes, notes, water intake counter (increment/decrement), mood emoji picker (5+ options), 3 gratitude fields, mini journal textarea; all fields save on button press
- **Couples Collaboration**: settings section to invite a partner by principal ID, view pending/accepted status, accept/decline invite, disconnect; active couple shows "Couple Mode" badge in header and merges both partners' data across all planner views
- Consistent warm-aesthetic theme: cream/warm white/soft taupe palette with dusty rose or warm amber accent, editorial typography, generous whitespace, rounded corners, soft card shadows

**User-visible outcome:** Users can track long-term goals on a vision board, plan their days in detail, view a consolidated dashboard of their progress, receive a daily motivational quote, and optionally link with a partner to collaborate on all planning data together.
