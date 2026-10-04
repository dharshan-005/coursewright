# Full-Stack Online Learning Management System

A web-based learning platform where users can register, browse courses, enroll, access learning materials, track progress, and submit assignments — with role-based dashboards for students, instructors, and admins.

**Live:** [coursewright1.vercel.app](https://coursewright1.vercel.app/) · **API:** [coursewright.onrender.com](https://coursewright.onrender.com)

## Team

| Name | Responsibility |
|---|---|
| Cheguri Sathyanand Reddy | Frontend UI/UX & Responsive Design |
| Dharshan V K | Database & Backend Integration (Courses, Lessons, Enrollments, Assignments, Submissions, Progress, API) |
| M R Keerthi Madhavi | Authentication, Dashboard & Application Integration |

## Features

**Authentication & Roles**
- Registration, login, logout, password change
- Role-based access: Student, Instructor, Admin
- JWT-based sessions; tokens are invalidated after a password change or if the account is deactivated

**Course Management**
- Browse, search, and filter courses by category
- Course details with instructor and lesson count
- Enroll / unenroll
- Instructors manage their own courses; admins manage all courses

**Learning Module**
- View enrolled courses
- Access lesson content, mark lessons as completed
- Per-course progress tracking

**Assignment Module**
- Create, view, and submit assignments
- Submission status tracking (Pending / Submitted / Graded)
- Deadline enforcement — submissions are rejected after the due date
- Instructors/admins grade submissions

**Dashboards**
- **Student:** enrolled courses, course progress, pending assignments, completed courses, recent activity
- **Instructor:** own courses, lessons, assignments, and submissions to grade
- **Admin:** manage users, courses, assignments, and view all enrollments

**Responsive Frontend**
- Works across desktop, tablet, and mobile, with a collapsible sidebar/drawer navigation

## Tech Stack

**Frontend:** React (Vite), React Router, Context API (`AuthContext`, `DataContext`), Axios, custom CSS

**Backend:** Node.js, Express, MongoDB with Mongoose, JWT (`jsonwebtoken`), bcrypt.js, `express-rate-limit`

**Deployment:** Frontend on Vercel (`vercel.json`); backend on [Render/Railway/your host — fill in]

## Project Structure

```
backend/
├── config/
│   └── db.js                     # MongoDB connection
├── controllers/
│   ├── assignmentController.js
│   ├── authController.js
│   ├── courseController.js
│   ├── dashboardController.js    # aggregated stats per role
│   ├── enrollmentController.js
│   ├── lessonController.js
│   ├── progressController.js
│   ├── submissionController.js
│   └── userController.js
├── middleware/
│   ├── auth.js                   # protect, authorize
│   └── errorHandler.js
├── models/
│   ├── Assignment.js
│   ├── Course.js
│   ├── Enrollment.js
│   ├── Lesson.js
│   ├── Progress.js
│   ├── Submission.js
│   └── User.js
├── routes/
│   ├── assignmentRoutes.js
│   ├── authRoutes.js
│   ├── courseRoutes.js
│   ├── dashboardRoutes.js
│   ├── enrollmentRoutes.js
│   ├── lessonRoutes.js
│   ├── progressRoutes.js
│   ├── submissionRoutes.js
│   └── userRoutes.js
├── scripts/
│   ├── seedAdmin.js               # creates the first admin account
│   ├── seedAssignments.js
│   └── seedCourses.js
├── utils/
│   ├── access.js                  # canAccessCourse
│   ├── asyncHandler.js
│   ├── http.js                    # ApiError, validators, sendAuthResponse
│   ├── ownership.js                # isCourseOwner
│   └── progress.js                 # calcProgress
├── .gitignore
├── app.js                          # Express app (middleware, routes)
├── server.js                       # starts the HTTP server
└── package.json

frontend/
├── src/
│   ├── api/                        # one file per resource (axios wrappers)
│   ├── components/
│   │   ├── AdminNavbar.jsx
│   │   ├── Navbar.jsx
│   │   ├── DashboardLayout.jsx
│   │   ├── PublicLayout.jsx
│   │   ├── RouteGuards.jsx         # role-based route protection
│   │   ├── CourseCard.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── StatCard.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── Modal.jsx
│   │   └── Footer.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── DataContext.jsx
│   ├── pages/
│   │   ├── Home.jsx, Login.jsx, Register.jsx, NotFound.jsx
│   │   ├── Courses.jsx, CourseDetails.jsx, MyCourses.jsx, Learning.jsx
│   │   ├── Assignments.jsx, Profile.jsx
│   │   ├── StudentDashboard.jsx, InstructorDashboard.jsx, AdminDashboard.jsx
│   │   └── ManageCourses.jsx, ManageLessons.jsx, ManageAssignments.jsx, ManageUsers.jsx
│   ├── utils/
│   │   └── dashboardPath.js        # resolves the right dashboard route per role
│   ├── App.jsx, main.jsx, index.css
├── vercel.json
├── vite.config.js
└── package.json
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- A MongoDB instance (local or Atlas)

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment variables

`backend/.env`:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AUTH_RATE_LIMIT=20
ALLOW_ADMIN_SIGNUP=false
```

`frontend/.env` (if the API base URL is configurable):
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Create the first admin account

Registration defaults every account to `student`. Run the seed script to create an admin without needing `ALLOW_ADMIN_SIGNUP`:

```bash
cd backend
node scripts/seedAdmin.js
```

Optionally seed sample data to test against:
```bash
node scripts/seedCourses.js
node scripts/seedAssignments.js
```

### 4. Run the app

```bash
# backend
cd backend
npm run dev        # http://localhost:5000

# frontend (separate terminal)
cd frontend
npm run dev         # http://localhost:5173
```

## API Overview

| Resource | Base route | Notes |
|---|---|---|
| Auth | `/api/auth` | register, login, logout, me, change-password |
| Users | `/api/users` | admin-only user management |
| Courses | `/api/courses` | public browse/search; create/update/delete restricted to the owning instructor or admin |
| Lessons | `/api/lessons` | enrolled students, the owning instructor, or admin |
| Enrollments | `/api/enrollments` | enroll/unenroll, view own enrollments; admin/instructor view all for their courses |
| Assignments | `/api/assignments` | view, submit; create/update/delete restricted to owning instructor or admin |
| Submissions | `/api/submissions` | submit, view own; instructor/admin grade |
| Progress | `/api/progress` | mark lessons complete, view per-course progress |
| Dashboard | `/api/dashboard` | aggregated stats per role (student/instructor/admin) |

All protected routes require `Authorization: Bearer <token>`.

## Deployment

- **Frontend:** [https://coursewright1.vercel.app/](https://coursewright1.vercel.app/) (Vercel)
- **Backend:** [https://coursewright.onrender.com](https://coursewright.onrender.com) (Render)
- **Database:** MongoDB Atlas

## Authors

Cheguri Sathyanand Reddy, Dharshan V K, M R Keerthi Madhavi
