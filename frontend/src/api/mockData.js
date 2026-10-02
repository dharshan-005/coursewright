// -----------------------------------------------------------------------
// mockData.js
//
// This project ships with NO seeded/demo records — no default courses,
// assignments, or users. Since there's no backend yet, the only data that
// exists is whatever people create while using the app:
//   - registering an account adds a user (see context/AuthContext.jsx)
//   - the Admin "Add New Course" / "Add New Assignment" modals add records
// All of that lives in context/DataContext.jsx, in memory, for the current
// browser session only — refreshing the page clears it, since there's
// nowhere real to persist it yet.
//
// What's left here are just fixed reference lists the UI needs regardless
// of how much real data exists (dropdown options, category filters) — not
// records that pretend to be real users/courses/assignments.
// -----------------------------------------------------------------------

export const categories = [
  'All',
  'Computer Science',
  'Web Development',
  'Design',
  'Cloud & DevOps',
  'Mobile Development',
];
