import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";
import CourseCard from "../components/CourseCard.jsx";
import { apiRequest } from "../api/client.js";

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    apiRequest("/courses/mine")
      .then((data) => {
        if (cancelled) return;

        setCourses(
          (data.courses || []).map((course) => ({
            ...course,
            id: course.id || course._id,
            instructor:
              typeof course.instructor === "object"
                ? course.instructor?.name || "You"
                : "You",
            color: "#1f6f54",
            thumbnail: course.thumbnail || "",
            level: course.level || "All levels",
            duration: course.duration || "Self-paced",
            rating: course.rating ?? 0,
            students: course.students ?? 0,
            progress: 0,
            syllabus: [],
          })),
        );
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError.message || "Could not load your courses.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="page-title-row">
        <div>
          <h1>Instructor Dashboard</h1>
          <p className="muted">Manage your courses and course content.</p>
        </div>

        <Link to="/instructor/courses" className="btn btn-primary">
          Manage Courses
        </Link>

        <Link to="/instructor/lessons" className="btn btn-ghost">
          Manage Lessons
        </Link>
      </div>

      {error && <p role="alert">{error}</p>}

      <h2 style={{ fontSize: "1.1rem" }}>Your Courses</h2>

      {loading ? (
        <p className="muted">Loading your courses...</p>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <h3>You haven’t created a course yet</h3>
          <p>Create a course to start adding lessons and assignments.</p>
          <Link to="/instructor/courses" className="btn btn-primary mt-16">
            Create a Course
          </Link>
        </div>
      ) : (
        <div className="grid grid-3 mt-16">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
