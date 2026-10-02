import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PublicLayout from "../components/PublicLayout.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import { getMyEnrollments } from "../api/courses.js";
import { useData } from "../context/DataContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function CourseDetails() {
  const { id } = useParams();
  const { courses, loading, enrollCourse } = useData();
  const { isAuthenticated } = useAuth();

  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState("");

  const course = courses.find((item) => item.id === id);
  const syllabus = course?.syllabus || [];

  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated || !course) {
      setIsEnrolled(false);
      return;
    }

    getMyEnrollments()
      .then((enrollments) => {
        if (cancelled) return;

        const enrolled = enrollments.some((enrollment) => {
          const enrolledCourse = enrollment.course;
          const enrolledCourseId =
            typeof enrolledCourse === "object"
              ? enrolledCourse?._id || enrolledCourse?.id
              : enrolledCourse;

          return String(enrolledCourseId) === String(course.id);
        });

        setIsEnrolled(enrolled);
      })
      .catch(() => {
        if (!cancelled) setIsEnrolled(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, course?.id]);

  async function handleEnroll() {
    setEnrolling(true);
    setEnrollmentError("");

    try {
      await enrollCourse(id);
      setIsEnrolled(true);
    } catch (error) {
      setEnrollmentError(error.message || "Could not enroll in this course.");
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="container section">
          <p className="muted">Loading course...</p>
        </div>
      </PublicLayout>
    );
  }

  if (!course) {
    return (
      <PublicLayout>
        <div className="container section empty-state">
          <h2>Course not found</h2>
          <Link to="/courses" className="btn btn-primary mt-16">
            Back to Courses
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section
        className="section"
        style={{ background: course.color || "#1f6f54" }}
      >
        <div className="container" style={{ color: "var(--cream)" }}>
          <span style={{ opacity: 0.85 }}>{course.category || "General"}</span>
          <h1 style={{ color: "var(--paper)", marginTop: 8 }}>
            {course.title}
          </h1>
          <p style={{ color: "var(--champagne)", maxWidth: "60ch" }}>
            {course.description || "No course description yet."}
          </p>

          <div
            style={{
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
              marginTop: 20,
              opacity: 0.9,
            }}
          >
            <span>Instructor: {course.instructor || "Instructor"}</span>
            <span>Level: {course.level || "All levels"}</span>
            <span>Duration: {course.duration || "Self-paced"}</span>
            <span>
              &#9733; {course.rating ?? 0} ({course.students ?? 0} students)
            </span>
          </div>
        </div>
      </section>

      <section
        className="container section"
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 32,
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.3rem" }}>Syllabus</h2>
          <div className="card mt-16">
            {syllabus.length === 0 ? (
              <p className="muted card-pad">
                Syllabus for this course hasn&rsquo;t been published yet.
              </p>
            ) : (
              syllabus.map((item, index) => (
                <div
                  key={item.week ?? index}
                  className="flex-between"
                  style={{
                    padding: "16px 20px",
                    borderBottom:
                      index === syllabus.length - 1
                        ? "none"
                        : "1px solid var(--line)",
                  }}
                >
                  <div>
                    <strong style={{ fontSize: "0.92rem" }}>
                      Week {item.week}: {item.title}
                    </strong>
                  </div>
                  <span
                    className={`badge ${
                      item.done ? "badge-completed" : "badge-pending"
                    }`}
                  >
                    {item.done ? "Completed" : "Upcoming"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="card card-pad">
            {!isAuthenticated ? (
              <>
                <p
                  className="muted"
                  style={{ fontSize: "0.9rem", marginBottom: 12 }}
                >
                  Log in to enroll and track your progress in this course.
                </p>
                <Link
                  to="/login"
                  state={{ from: `/courses/${course.id}` }}
                  className="btn btn-primary btn-block"
                >
                  Log in to Enroll
                </Link>
              </>
            ) : isEnrolled || course.enrolled || course.progress > 0 ? (
              <>
                <ProgressBar value={course.progress || 0} />
                <Link
                  to={`/learning?courseId=${encodeURIComponent(course.id)}`}
                  className="btn btn-primary btn-block mt-16"
                >
                  Go to lessons
                </Link>
              </>
            ) : (
              <button
                className="btn btn-primary btn-block"
                type="button"
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? "Enrolling..." : "Enroll in this Course"}
              </button>
            )}

            {enrollmentError && (
              <p
                role="alert"
                className="mt-16"
                style={{ color: "var(--danger)" }}
              >
                {enrollmentError}
              </p>
            )}

            <p className="muted mt-16" style={{ fontSize: "0.85rem" }}>
              Enrollment gives you access to all lessons, assignments, and
              progress tracking for this course.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
