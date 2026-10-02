import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";
import StatCard from "../components/StatCard.jsx";
import CourseCard from "../components/CourseCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../context/DataContext.jsx";
import { getMyDashboard } from "../api/dashboard";
import { getMyEnrollments } from "../api/courses.js";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { courses, assignments, activity } = useData();
  const [account, setAccount] = useState(null);
  const [myCourses, setMyCourses] = useState([]);

  useEffect(() => {
    getMyEnrollments()
      .then((enrollments) => {
        setMyCourses(
          enrollments
            .filter((enrollment) => enrollment.course)
            .map(({ course, progress }) => ({
              ...course,
              id: course.id || course._id,
              progress: Number(progress) || 0,
              color: "#1f6f54",
              thumbnail: course.thumbnail || "",
              instructor:
                typeof course.instructor === "object"
                  ? course.instructor?.name || "Instructor"
                  : "Instructor",
              level: course.level || "All levels",
              duration: course.duration || "Self-paced",
              rating: course.rating ?? 0,
              students: course.students ?? 0,
              syllabus: course.syllabus || [],
            })),
        );
      })
      .catch(() => setMyCourses([]));
  }, []);

  // Account summary from the API (GET /api/dashboard/me).
  useEffect(() => {
    getMyDashboard()
      .then((data) => setAccount(data.account))
      .catch(() => setAccount(null));
  }, []);

  // const myCourses = courses.filter((c) => c.progress > 0);
  const completedCourses = myCourses.filter((c) => c.progress === 100);
  const averageProgress = myCourses.length
    ? Math.round(
        myCourses.reduce((sum, c) => sum + c.progress, 0) / myCourses.length,
      )
    : 0;
  const pendingAssignments = assignments.filter(
    (a) => a.status === "pending" || a.status === "overdue",
  );
  const continueLearning = myCourses.find(
    (c) => c.progress > 0 && c.progress < 100,
  );

  return (
    <DashboardLayout variant="student">
      <h1 style={{ fontSize: "1.6rem" }}>
        Welcome back, {user.name.split(" ")[0]}
      </h1>
      <p className="muted" style={{ marginBottom: account ? 12 : 28 }}>
        Here's where things stand across your courses and assignments.
      </p>
      {account && (
        <p className="muted" style={{ fontSize: "0.85rem", marginBottom: 28 }}>
          <span style={{ textTransform: "capitalize" }}>{account.role}</span>{" "}
          account · member for {account.daysOnPlatform} day
          {account.daysOnPlatform === 1 ? "" : "s"}
          {!account.profileComplete && (
            <>
              {" · "}
              <Link to="/profile">Add a bio to complete your profile</Link>
            </>
          )}
        </p>
      )}

      <div className="grid grid-4">
        <StatCard label="Enrolled courses" value={myCourses.length} accent />
        <StatCard label="Average progress" value={`${averageProgress}%`} />
        <StatCard label="Completed courses" value={completedCourses.length} />
        <StatCard
          label="Pending assignments"
          value={pendingAssignments.length}
        />
      </div>

      {courses.length === 0 ? (
        <div className="card card-pad mt-24 empty-state">
          <h3>No courses on the platform yet</h3>
          <p className="muted">
            Once an admin adds a course, it'll show up here to enroll in.
          </p>
        </div>
      ) : myCourses.length === 0 ? (
        <div className="card card-pad mt-24 empty-state">
          <h3>No enrolled courses yet</h3>
          <p className="muted">
            Browse the catalog and enroll in your first course.
          </p>
          <Link to="/courses" className="btn btn-primary mt-16">
            Browse Courses
          </Link>
        </div>
      ) : (
        <>
          {continueLearning && (
            <div
              className="card card-pad mt-24 flex-between"
              style={{ flexWrap: "wrap", gap: 16 }}
            >
              <div>
                <span className="course-category">Continue Learning</span>
                <h3 style={{ fontSize: "1.15rem", margin: "6px 0" }}>
                  {continueLearning.title}
                </h3>
                <div style={{ maxWidth: 300 }}>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${continueLearning.progress}%` }}
                    />
                  </div>
                </div>
              </div>
              <Link to="/learning" className="btn btn-primary">
                Resume Course
              </Link>
            </div>
          )}

          <div className="section-head mt-32">
            <div>
              <h2 style={{ fontSize: "1.2rem" }}>Your courses</h2>
            </div>
            <Link to="/my-courses" className="btn btn-ghost btn-sm">
              View all
            </Link>
          </div>
          <div className="grid grid-3">
            {myCourses.slice(0, 3).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 28,
          marginTop: 36,
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.2rem" }}>Pending assignments</h2>
          <div className="card mt-16">
            {pendingAssignments.length === 0 ? (
              <p className="muted card-pad">You're all caught up.</p>
            ) : (
              pendingAssignments.map((a, idx) => (
                <div
                  key={a.id}
                  className="flex-between"
                  style={{
                    padding: "14px 20px",
                    borderBottom:
                      idx === pendingAssignments.length - 1
                        ? "none"
                        : "1px solid var(--line)",
                  }}
                >
                  <div>
                    <strong style={{ fontSize: "0.9rem" }}>{a.title}</strong>
                    <p
                      className="muted"
                      style={{ margin: 0, fontSize: "0.82rem" }}
                    >
                      {a.course}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: "1.2rem" }}>Recent activity</h2>
          <div className="card mt-16">
            {activity.length === 0 ? (
              <p className="muted card-pad">
                Nothing yet — enrolling in a course, completing a lesson, or
                submitting an assignment will show up here.
              </p>
            ) : (
              activity.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    padding: "14px 20px",
                    borderBottom:
                      idx === activity.length - 1
                        ? "none"
                        : "1px solid var(--line)",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "0.9rem" }}>{item.text}</p>
                  <span className="muted" style={{ fontSize: "0.78rem" }}>
                    {item.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
