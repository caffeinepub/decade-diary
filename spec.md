# Specification

## Summary
**Goal:** Remove the hard-coded limit on the number of vision board goals a user can create, allowing unlimited goals in both the frontend and backend.

**Planned changes:**
- Remove any frontend cap or maximum count check that disables or blocks adding more vision board goals
- Remove any backend (Motoko) enforcement of a maximum number of vision board goals per user

**User-visible outcome:** Users can add as many vision board goals as they want without hitting any limit, error message, or disabled "Add Goal" button.
