import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";
import CourseCard from "../components/CourseCard.jsx";
import { apiRequest } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

function courseForCard(course, progress = 0) {
  return {
    ...course,
    id: course.id || course._id,
    instructor:
      typeof course.instructor === "object"
        ? course.instructor?.name || "Instructor"
        : "Instructor",
    thumbnail: course.thumbnail || "",
    color: "#1f6f54",
    level: course.level || "All levels",
    duration: course.duration || "Self-paced",
    rating: course.rating ?? 0,
    students: course.students ?? 0,
    progress: Number.isFinite(Number(progress)) ? Number(progress) : 0,
    syllabus: course.syllabus || [],
  };
}

export default function MyCourses() {
  const { user } = useAuth();
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isInstructor = user?.role === "instructor";

  useEffect(() => {
    let cancelled = false;

    async function loadMyCourses() {
      setLoading(true);
      setError("");

      try {
        if (isInstructor) {
          const data = await apiRequest("/courses/mine");
          const courses = (data.courses || []).map((course) =>
            courseForCard(course),
          );

          if (!cancelled) setMyCourses(courses);
        } else {
          const data = await apiRequest("/enrollments/my");
          const courses = (data.enrollments || [])
            .filter((enrollment) => enrollment.course)
            .map((enrollment) =>
              courseForCard(enrollment.course, enrollment.progress),
            );

          if (!cancelled) setMyCourses(courses);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message || "Could not load your courses.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMyCourses();

    return () => {
      cancelled = true;
    };
  }, [isInstructor]);

  const inProgress = myCourses.filter((course) => course.progress < 100);
  const completed = myCourses.filter((course) => course.progress >= 100);

  return (
    <DashboardLayout>
      <div className="page-title-row">
        <div>
          <h1 style={{ fontSize: "1.6rem" }}>My Courses</h1>
          <p className="muted">
            {isInstructor
              ? "Courses you teach."
              : "Everything you’re currently enrolled in."}
          </p>
        </div>

        {isInstructor && (
          <Link to="/instructor/courses" className="btn btn-primary">
            Manage Courses
          </Link>
        )}
      </div>

      {error && (
        <p role="alert" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}

      {loading ? (
        <p className="muted">Loading your courses...</p>
      ) : myCourses.length === 0 ? (
        <div className="empty-state">
          <h3>
            {isInstructor
              ? "You haven’t created any courses yet"
              : "You haven’t enrolled in any courses yet"}
          </h3>
          <p>
            {isInstructor
              ? "Create a course to get started."
              : "Browse the catalog to get started."}
          </p>
          <Link
            to={isInstructor ? "/instructor/courses" : "/courses"}
            className="btn btn-primary mt-16"
          >
            {isInstructor ? "Manage Courses" : "Browse Courses"}
          </Link>
        </div>
      ) : (
        <>
          {inProgress.length > 0 && (
            <>
              <h2 style={{ fontSize: "1.1rem" }}>
                {isInstructor ? "Your Courses" : "In Progress"}
              </h2>
              <div className="grid grid-3 mt-16" style={{ marginBottom: 36 }}>
                {inProgress.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          )}

          {!isInstructor && completed.length > 0 && (
            <>
              <h2 style={{ fontSize: "1.1rem" }}>Completed</h2>
              <div className="grid grid-3 mt-16">
                {completed.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
