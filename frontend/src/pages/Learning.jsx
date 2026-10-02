import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import { apiRequest } from "../api/client.js";
import { getProgress, updateProgress } from "../api/progress.js";
import { useData } from "../context/DataContext.jsx";

export default function Learning() {
  const [searchParams] = useSearchParams();
  const requestedCourseId = searchParams.get("courseId");
  const { courses } = useData();

  const [lessons, setLessons] = useState([]);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const course = useMemo(() => {
    if (requestedCourseId) {
      return courses.find((item) => item.id === requestedCourseId);
    }

    return (
      courses.find((item) => item.progress > 0 && item.progress < 100) ||
      courses.find((item) => item.progress > 0)
    );
  }, [courses, requestedCourseId]);

  useEffect(() => {
    let cancelled = false;

    async function loadLessons() {
      if (!requestedCourseId) {
        setLessons([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [lessonData, progressData] = await Promise.all([
          apiRequest(
            `/lessons?course=${encodeURIComponent(requestedCourseId)}`,
          ),
          getProgress(requestedCourseId),
        ]);

        if (cancelled) return;

        const loadedLessons = (lessonData.lessons || []).map((lesson) => ({
          ...lesson,
          id: lesson.id || lesson._id,
        }));

        const loadedProgress = Number(progressData.progress);

        setLessons(loadedLessons);
        setCompletedLessonIds(
          (progressData.completedLessons || []).map(String),
        );
        setProgress(Number.isFinite(loadedProgress) ? loadedProgress : 0);
        setActiveIndex(0);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError.message || "Could not load this course's lessons.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLessons();

    return () => {
      cancelled = true;
    };
  }, [requestedCourseId]);

  const lesson = lessons[activeIndex];
  const isLessonComplete =
    lesson && completedLessonIds.includes(String(lesson.id));

  async function handleComplete() {
    if (!lesson || saving) return;

    setSaving(true);
    setError("");

    try {
      const result = await updateProgress(lesson.id, true);
      const updatedProgress = Number(result.courseProgress);

      setCompletedLessonIds((previous) =>
        previous.includes(String(lesson.id))
          ? previous
          : [...previous, String(lesson.id)],
      );

      if (Number.isFinite(updatedProgress)) {
        setProgress(updatedProgress);
      }

      if (activeIndex < lessons.length - 1) {
        setActiveIndex((index) => index + 1);
      }
    } catch (saveError) {
      setError(saveError.message || "Could not save lesson progress.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout variant="student">
        <p className="muted">Loading lessons...</p>
      </DashboardLayout>
    );
  }

  if (error && lessons.length === 0) {
    return (
      <DashboardLayout variant="student">
        <div className="empty-state">
          <h3>Could not load lessons</h3>
          <p className="muted">{error}</p>
          <Link to="/courses" className="btn btn-primary mt-16">
            Browse Courses
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (!requestedCourseId || !course) {
    return (
      <DashboardLayout variant="student">
        <div className="empty-state">
          <h3>Select a course to start learning</h3>
          <p className="muted">
            Open a course you’re enrolled in to view its lessons.
          </p>
          <Link to="/courses" className="btn btn-primary mt-16">
            Browse Courses
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (lessons.length === 0) {
    return (
      <DashboardLayout variant="student">
        <div className="empty-state">
          <h3>{course.title}</h3>
          <p className="muted">
            This course doesn’t have any published lessons yet.
          </p>
          {error && <p role="alert">{error}</p>}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout variant="student">
      <div
        style={{
          width: "100%",
          maxWidth: 1400,
          minWidth: 0,
          marginInline: "auto",
        }}
      >
        <div className="page-title-row">
          <div style={{ minWidth: 0 }}>
            <span className="course-category">{course.title}</span>
            <h1 style={{ fontSize: "1.6rem" }}>{lesson.title}</h1>
          </div>

          <div style={{ minWidth: 200 }}>
            <ProgressBar value={progress} />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
            gap: 28,
            width: "100%",
            minWidth: 0,
          }}
        >
          <div className="card card-pad" style={{ minWidth: 0 }}>
            <div
              style={{
                width: "100%",
                aspectRatio: "16 / 9",
                marginBottom: 20,
                background: "var(--ink)",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
              }}
            >
              {lesson.videoUrl ? (
                <video
                  controls
                  src={lesson.videoUrl}
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                >
                  Your browser does not support video playback.
                </video>
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    color: "var(--champagne)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  No video added for this lesson yet.
                </div>
              )}
            </div>

            <h3 style={{ fontSize: "1.1rem" }}>About this lesson</h3>
            <p className="muted">
              {lesson.content || "No lesson notes have been added yet."}
            </p>

            {error && (
              <p role="alert" style={{ color: "var(--danger)" }}>
                {error}
              </p>
            )}

            <div
              className="flex-between mt-24"
              style={{ gap: 12, flexWrap: "wrap" }}
            >
              <button
                className="btn btn-ghost"
                type="button"
                disabled={activeIndex === 0 || saving}
                onClick={() =>
                  setActiveIndex((index) => Math.max(0, index - 1))
                }
                style={{
                  visibility: activeIndex === 0 ? "hidden" : "visible",
                }}
              >
                Previous Lesson
              </button>

              <button
                className="btn btn-primary"
                type="button"
                disabled={saving || isLessonComplete}
                onClick={handleComplete}
              >
                {saving
                  ? "Saving..."
                  : isLessonComplete
                    ? "Completed"
                    : activeIndex === lessons.length - 1
                      ? "Mark Complete"
                      : "Mark Complete & Next"}
              </button>
            </div>
          </div>

          <div className="card card-pad" style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: "1rem" }}>Course content</h3>

            <div className="mt-16">
              {lessons.map((item, index) => {
                const done = completedLessonIds.includes(String(item.id));

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className="flex-between"
                    style={{
                      width: "100%",
                      minWidth: 0,
                      background:
                        index === activeIndex
                          ? "var(--emerald-pale)"
                          : "transparent",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      padding: "10px 12px",
                      cursor: "pointer",
                      marginBottom: 4,
                      textAlign: "left",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    <span style={{ minWidth: 0, fontSize: "0.88rem" }}>
                      {item.order || index + 1}. {item.title}
                    </span>
                    <span>{done ? "\u2713" : "\u25CB"}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
