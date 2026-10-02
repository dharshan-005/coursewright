import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { apiRequest } from "../api/client.js";

const categories = [
  "Programming",
  "Design",
  "Business",
  "Science",
  "Mathematics",
  "Other",
];

const emptyForm = {
  title: "",
  description: "",
  category: "Programming",
  thumbnail: "",
};

function toCourseView(course) {
  return {
    ...course,
    id: course.id || course._id,
    instructor:
      typeof course.instructor === "object"
        ? course.instructor?.name || "Instructor"
        : "Instructor",
  };
}

export default function ManageCourses({ variant = "admin" }) {
  const isInstructor = variant === "instructor";
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest(
        isInstructor ? "/courses/mine" : "/courses",
      );
      setCourses((data.courses || []).map(toCourseView));
    } catch (requestError) {
      setError(requestError.message || "Could not load courses.");
    } finally {
      setLoading(false);
    }
  }, [isInstructor]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  }

  function openEditModal(course) {
    setEditingId(course.id);
    setForm({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "Programming",
      thumbnail: course.thumbnail || "",
    });
    setError("");
    setShowModal(true);
  }

  async function handleDelete(courseId) {
    setError("");

    try {
      await apiRequest(`/courses/${encodeURIComponent(courseId)}`, {
        method: "DELETE",
      });
      setCourses((current) =>
        current.filter((course) => course.id !== courseId),
      );
    } catch (requestError) {
      setError(requestError.message || "Could not delete this course.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const body = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      thumbnail: form.thumbnail.trim(),
    };

    try {
      if (editingId) {
        await apiRequest(`/courses/${encodeURIComponent(editingId)}`, {
          method: "PUT",
          body,
        });
      } else {
        await apiRequest("/courses", {
          method: "POST",
          body,
        });
      }

      setShowModal(false);
      await loadCourses();
    } catch (requestError) {
      setError(requestError.message || "Could not save this course.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout variant={isInstructor ? "student" : "admin"}>
      <div className="page-title-row">
        <div>
          <h1 style={{ fontSize: "1.6rem" }}>
            {isInstructor ? "My Courses" : "Manage Courses"}
          </h1>
          <p className="muted">
            {courses.length} {courses.length === 1 ? "course" : "courses"}{" "}
            {isInstructor ? "owned by you" : "on the platform"}.
          </p>
        </div>

        <button
          className="btn btn-primary"
          type="button"
          onClick={openAddModal}
        >
          Add New Course
        </button>
      </div>

      {error && (
        <p role="alert" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}

      {loading ? (
        <p className="muted">Loading courses...</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                {!isInstructor && <th>Instructor</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td
                    colSpan={isInstructor ? 3 : 4}
                    className="muted"
                    style={{ textAlign: "center" }}
                  >
                    No courses yet. Click “Add New Course” to create one.
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.title}</td>
                    <td>{course.category}</td>
                    {!isInstructor && <td>{course.instructor}</td>}
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          type="button"
                          onClick={() => openEditModal(course)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          type="button"
                          onClick={() => handleDelete(course.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => !saving && setShowModal(false)}
        >
          <div
            className="modal-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h2 style={{ fontSize: "1.15rem", margin: 0 }}>
                {editingId ? "Edit Course" : "Add New Course"}
              </h2>
              <button
                className="modal-close"
                type="button"
                aria-label="Close"
                disabled={saving}
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="title">Course title</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={form.title}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="thumbnail">Thumbnail image URL</label>
                <input
                  id="thumbnail"
                  name="thumbnail"
                  type="url"
                  placeholder="https://example.com/course-image.jpg"
                  value={form.thumbnail}
                  onChange={handleChange}
                />
              </div>

              {error && (
                <p role="alert" style={{ color: "var(--danger)" }}>
                  {error}
                </p>
              )}

              <div className="modal-actions">
                <button
                  className="btn btn-ghost"
                  type="button"
                  disabled={saving}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
