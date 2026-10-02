import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar.jsx";

export default function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course.id}`} className="course-card">
      <div className="course-thumb" style={{ background: course.color }}>
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          course.title?.slice(0, 3).toUpperCase()
        )}
      </div>
      <div className="course-card-body">
        <span className="course-category">{course.category}</span>
        <h3 style={{ fontSize: "1.05rem" }}>{course.title}</h3>
        <p className="muted" style={{ fontSize: "0.88rem", margin: 0 }}>
          {course.instructor}
        </p>
        <div className="course-meta-row">
          <span>{course.level}</span>
          <span>{course.duration}</span>
          <span className="course-rating">&#9733; {course.rating}</span>
        </div>
        {course.progress > 0 && <ProgressBar value={course.progress} />}
        <button className="btn btn-primary btn-sm btn-block mt-8" type="button">
          {course.progress > 0 ? "Continue Learning" : "View Course"}
        </button>
      </div>
    </Link>
  );
}
