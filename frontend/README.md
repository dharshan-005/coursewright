# Coursewright — LMS Frontend

Frontend-only build of a Full-Stack Online Learning Management System, built with
React, React Router, and plain CSS (no paid libraries, no backend). This is the
**Frontend UI/UX** module of a 4-member Major Project — the backend, database,
and authentication server are being built separately by the rest of the team.

## Project structure

```
frontend/
├── src/
│   ├── components/       Reusable UI pieces (Navbar, Sidebar, Footer, CourseCard, ...)
│   ├── pages/             One file per route/page (Home, Login, Dashboard, ...)
│   ├── api/                Mock API functions your teammates will replace
│   │   ├── mockData.js    Dummy data used everywhere for now
│   │   ├── auth.js         loginUser, registerUser, logoutUser, getCurrentUser
│   │   ├── courses.js      getCourses, getCourseById, getMyCourses, enrollInCourse
│   │   ├── assignments.js getAssignments, submitAssignment
│   │   ├── users.js        getAllUsers, getRecentUsers, updateUser, deleteUser
│   │   └── progress.js    getProgress, updateProgress
│   ├── App.jsx             All routes
│   ├── main.jsx            React entry point
│   └── index.css           Design tokens + all component styles
├── index.html
├── package.json
└── vite.config.js
```

## Getting started

Requires [Node.js](https://nodejs.org/) 18+ installed.

```powershell
npm install
npm run dev
```

Then open the URL shown in the terminal (usually `http://localhost:5173`).

To build a production bundle:

```powershell
npm run build
npm run preview
```

## Connecting the real backend

Every function your teammates need is already stubbed out in `src/api/`, each
one returning mock data with a short artificial delay so loading states behave
realistically. Each file has a `TODO (backend team)` comment showing exactly
where the real base URL and `fetch`/`axios` call should go. Nothing else in
the app needs to change — pages call these functions, not `fetch` directly.

Example, in `src/api/courses.js`:

```js
// TODO (backend team): replace with real REST calls, e.g.
//   const BASE_URL = 'https://api.yourlms.com/v1'; // <-- real backend URL goes here
//   export async function getCourses() {
//     const res = await fetch(`${BASE_URL}/courses`);
//     return res.json();
//   }
```

Routes for `/dashboard`, `/my-courses`, `/assignments`, `/profile`, and the
whole `/admin/*` area are grouped by role in `src/App.jsx` with a comment
marking where real auth guards (e.g. redirecting non-logged-in users, or
checking `role === 'admin'`) should be added once JWT auth exists.

For the Git/GitHub workflow (init, push, branches, pull requests), see the
`README.md` at the root of the `learning-management-system` project — Git is
set up once for the whole project, not separately inside `frontend/`.

## What actually works right now (frontend-only)

This isn't just a static mockup — the interactive pieces a frontend developer
can reasonably build without a backend are wired up using two React Context
providers (`src/context/AuthContext.jsx` and `src/context/DataContext.jsx`),
so the whole app shares one in-memory "session" and one in-memory "database":

- **Login / Register** actually sign you in — the name you type becomes your
  session user everywhere (Navbar, Dashboard greeting, Profile). The session
  is kept in `localStorage` only so a page refresh doesn't log you out mid-demo;
  it is not real authentication.
- **Log in as Student or Admin** — a role selector on the Login/Register forms
  lets you demo both areas without a real backend deciding permissions.
- **Route protection** — `/dashboard`, `/my-courses`, `/assignments`,
  `/profile` require being logged in; `/admin/*` requires the "admin" role.
  Both redirect to `/login` (see `src/components/RouteGuards.jsx`).
- **Enroll in a course** on Course Details moves it into My Courses and the
  Dashboard immediately.
- **Completing a lesson** on the Learning page updates that course's progress
  bar everywhere it's shown.
- **Submitting an assignment** flips its status live.
- **Admin → Manage Courses / Manage Assignments / Manage Users** each have a
  working **Add** and **Edit** modal plus **Remove** — and because everything
  reads from the same shared `DataContext`, a course an admin adds shows up
  immediately in the student-facing Courses catalog too.

None of this is persisted to a real database — refreshing the page reloads
the original mock data from `src/api/mockData.js`. Every mutation function in
`DataContext.jsx` and `AuthContext.jsx` has a `TODO (backend team)` comment
showing exactly which REST call replaces it.

## Notes

- All data is currently mocked in `src/api/mockData.js` — nothing is
  persisted; refreshing the page resets any local UI state.
- Student and Admin areas share the same `DashboardLayout`/`Sidebar`
  components with a `variant` prop, so new pages in either area are quick to
  add.
- The color system ("Emerald Ink & Champagne") and all component styles live
  in `src/index.css` as CSS custom properties — change the values at the top
  of the file to retheme the whole app.
