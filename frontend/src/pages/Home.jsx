import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout.jsx";
import CourseCard from "../components/CourseCard.jsx";
import { useData } from "../context/DataContext.jsx";
import { getPublicStats } from "../api/dashboard";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { user, isAuthenticated, initializing } = useAuth();
  const { courses, assignments } = useData();
  const [userCount, setUserCount] = useState(null);

  useEffect(() => {
    if (isAuthenticated) return;

    getPublicStats()
      .then((stats) => setUserCount(stats.users))
      .catch(() => setUserCount(null));
  }, [isAuthenticated]);

  if (initializing) return null;

  if (isAuthenticated) {
    const destination =
      user.role === "admin"
        ? "/admin"
        : user.role === "instructor"
          ? "/instructor"
          : "/dashboard";

    return <Navigate to={destination} replace />;
  }

  const featured = courses.slice(0, 3);

  return (
    <PublicLayout>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <h1>
              Learning that fits around your term, not the other way round
            </h1>
            <p className="lede">
              Coursewright brings your lectures, assignments, and progress into
              one place, so a free hour between classes is enough to move a
              course forward.
            </p>
            <div className="hero-actions">
              <Link to="/courses" className="btn btn-champagne">
                Browse Courses
              </Link>
              <Link
                to="/register"
                className="btn btn-secondary"
                style={{ borderColor: "#f3e6c8", color: "#f3e6c8" }}
              >
                Create an Account
              </Link>
            </div>
          </div>
          <div className="hero-stat-card">
            <div className="hero-stat-row">
              <span>Registered users</span>
              <span className="hero-stat-num">{userCount ?? "—"}</span>
            </div>
            <div className="hero-stat-row">
              <span>Courses available</span>
              <span className="hero-stat-num">{courses.length}</span>
            </div>
            <div className="hero-stat-row">
              <span>Assignments posted</span>
              <span className="hero-stat-num">{assignments.length}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <div>
            <h2>Pick up where you left off</h2>
            <p>
              Courses added by an admin will appear here as soon as
              they&rsquo;re created.
            </p>
          </div>
          <Link to="/courses" className="btn btn-ghost btn-sm">
            View all courses
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="empty-state">
            <h3>No courses yet</h3>
            <p>
              Once an admin adds a course, it&rsquo;ll show up here and in the
              catalog.
            </p>
          </div>
        ) : (
          <div className="grid grid-3">
            {featured.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      <section className="section" style={{ background: "var(--champagne)" }}>
        <div className="container grid grid-3">
          <div className="card card-pad">
            <h3 style={{ fontSize: "1.1rem" }}>Structured lessons</h3>
            <p className="muted">
              Every course is broken into a clear weekly syllabus, so you always
              know what's next.
            </p>
          </div>
          <div className="card card-pad">
            <h3 style={{ fontSize: "1.1rem" }}>Assignment tracking</h3>
            <p className="muted">
              Deadlines, submissions, and grading status live in one dashboard
              &mdash; nothing gets lost.
            </p>
          </div>
          <div className="card card-pad">
            <h3 style={{ fontSize: "1.1rem" }}>Progress at a glance</h3>
            <p className="muted">
              Course and lesson progress bars keep you honest about how much is
              left to cover.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
