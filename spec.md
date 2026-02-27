# Specification

## Summary
**Goal:** Automatically rotate the daily quote in the Dashboard's "Today's Inspiration" section based on the current date, replacing any static/hardcoded quote.

**Planned changes:**
- Store a curated list of at least 30 inspirational quotes in the backend with a date-based query function that deterministically returns one quote per calendar day (UTC).
- Update the Dashboard's Today's Inspiration section to fetch the daily quote from the backend, removing any hardcoded quote from the frontend.
- Preserve the existing pastel brown text styling and transparent background of the section.

**User-visible outcome:** Each day, visitors to the Dashboard automatically see a different inspirational quote in the Today's Inspiration section without any manual intervention or page reload.
