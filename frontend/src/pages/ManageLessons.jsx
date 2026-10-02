import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { apiRequest } from "../api/client.js";

const emptyForm = {
  title: "",
  content: "",
  videoUrl: "",
  order: 1,
};

export default function ManageLessons() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [lessons, setLessons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    apiRequest("/courses/mine")
      .then((data) => {
        if (cancelled) return;
        const ownedCourses = data.courses || [];
        setCourses(ownedCourses);
        if (ownedCourses.length) {
          setCourseId(ownedCourses[0]._id || ownedCourses[0].id);
        }
      })
      .catch((requestError) => {
        if (!cancelled)
          setError(requestError.message || "Could not load courses.");
      })
      .finally(() => {
        if (!cancelled) setLoadingCourses(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function loadLessons(selectedCourseId) {
    if (!selectedCourseId) {
      setLessons([]);
      return;
    }

    setLoadingLessons(true);
    setError("");

    try {
      const data = await apiRequest(
        `/lessons?course=${encodeURIComponent(selectedCourseId)}`,
      );
      setLessons(data.lessons || []);
    } catch (requestError) {
      setError(requestError.message || "Could not load lessons.");
    } finally {
      setLoadingLessons(false);
    }
  }

  useEffect(() => {
    loadLessons(courseId);
  }, [courseId]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId("");
  }

  function editLesson(lesson) {
    setEditingId(lesson._id || lesson.id);
    setForm({
      title: lesson.title || "",
      content: lesson.content || "",
      videoUrl: lesson.videoUrl || "",
      order: lesson.order || 1,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!courseId) {
      setError("Create a course before adding lessons.");
      return;
    }

    setSaving(true);
    setError("");

    const body = {
      course: courseId,
      title: form.title.trim(),
      content: form.content.trim(),
      videoUrl: form.videoUrl.trim(),
      order: Number(form.order) || 1,
    };

    try {
      if (editingId) {
        await apiRequest(`/lessons/${encodeURIComponent(editingId)}`, {
          method: "PUT",
          body,
        });
      } else {
        await apiRequest("/lessons", { method: "POST", body });
      }

      resetForm();
      await loadLessons(courseId);
    } catch (requestError) {
      setError(requestError.message || "Could not save the lesson.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteLesson(lessonId) {
    setError("");

    try {
      await apiRequest(`/lessons/${encodeURIComponent(lessonId)}`, {
        method: "DELETE",
      });
      await loadLessons(courseId);
    } catch (requestError) {
      setError(requestError.message || "Could not delete the lesson.");
    }
  }

  return (
    <DashboardLayout>
      <div className="page-title-row">
        <div>
          <h1 style={{ fontSize: "1.6rem" }}>Manage Lessons</h1>
          <p className="muted">Add and organize lessons in your courses.</p>
        </div>
      </div>

      {error && (
        <p role="alert" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}

      {loadingCourses ? (
        <p className="muted">Loading your courses...</p>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <h3>You haven’t created a course yet</h3>
          <p>Create a course first, then you can add its lessons.</p>
        </div>
      ) : (
        <>
          <div className="field">
            <label htmlFor="course">Course</label>
            <select
              id="course"
              value={courseId}
              onChange={(event) => {
                resetForm();
                setCourseId(event.target.value);
              }}
            >
              {courses.map((course) => {
                const id = course._id || course.id;
                return (
                  <option key={id} value={id}>
                    {course.title}
                  </option>
                );
              })}
            </select>
          </div>

          <form className="card card-pad mt-16" onSubmit={handleSubmit}>
            <h2 style={{ fontSize: "1.15rem" }}>
              {editingId ? "Edit Lesson" : "Add a Lesson"}
            </h2>

            <div className="field">
              <label htmlFor="title">Lesson title</label>
              <input
                id="title"
                required
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
              />
            </div>

            <div className="field">
              <label htmlFor="content">Lesson content / notes</label>
              <textarea
                id="content"
                rows={5}
                value={form.content}
                onChange={(event) =>
                  setForm({ ...form, content: event.target.value })
                }
              />
            </div>

            <div className="field">
              <label htmlFor="videoUrl">Video URL (optional)</label>
              <input
                id="videoUrl"
                type="url"
                placeholder="https://example.com/lesson.mp4"
                value={form.videoUrl}
                onChange={(event) =>
                  setForm({ ...form, videoUrl: event.target.value })
                }
              />
            </div>

            <div className="field">
              <label htmlFor="order">Lesson order</label>
              <input
                id="order"
                type="number"
                min="1"
                value={form.order}
                onChange={(event) =>
                  setForm({ ...form, order: event.target.value })
                }
              />
            </div>

            <div className="modal-actions">
              {editingId && (
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel Edit
                </button>
              )}
              <button
                className="btn btn-primary"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Lesson"
                    : "Add Lesson"}
              </button>
            </div>
          </form>

          <h2 className="mt-32" style={{ fontSize: "1.15rem" }}>
            Course Lessons
          </h2>

          {loadingLessons ? (
            <p className="muted">Loading lessons...</p>
          ) : lessons.length === 0 ? (
            <p className="muted">
              No lessons have been added to this course yet.
            </p>
          ) : (
            <div className="card mt-16">
              {lessons.map((lesson, index) => {
                const id = lesson._id || lesson.id;
                return (
                  <div
                    key={id}
                    className="flex-between"
                    style={{
                      gap: 16,
                      padding: "14px 20px",
                      borderBottom:
                        index === lessons.length - 1
                          ? "none"
                          : "1px solid var(--line)",
                    }}
                  >
                    <div>
                      <strong>
                        {lesson.order || index + 1}. {lesson.title}
                      </strong>
                      <p className="muted" style={{ margin: 0 }}>
                        {lesson.videoUrl ? "Video attached" : "No video"}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        type="button"
                        onClick={() => editLesson(lesson)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        type="button"
                        onClick={() => deleteLesson(id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
