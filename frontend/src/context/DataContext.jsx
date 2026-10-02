import { createContext, useContext, useEffect, useState } from "react";
import { getCourses, enrollInCourse as apiEnroll } from "../api/courses";
import {
  getAssignments,
  submitAssignment as apiSubmit,
} from "../api/assignments";

// -----------------------------------------------------------------------
// DataContext
//
// A single in-memory store for courses, assignments, and a small activity
// feed, shared by every page. (Users and authentication are NOT here any
// more — they live in the real backend; see context/AuthContext.jsx,
// api/users.js and api/dashboard.js.) This is what makes the app feel
// "full-stack" while there's still no real backend: when an admin adds a
// course on Manage Courses, it immediately shows up in the student-facing
// Courses catalog too, and when a student enrolls or submits work, it
// shows up in their own "Recent activity" list — because every page reads
// from this same context instead of each having its own local copy.
//
// The app starts completely empty (see src/api/mockData.js) — there are
// no seeded demo users, courses, or assignments. Everything you see is
// something that was actually added: a registration, or something an
// admin created.
//
// Nothing here is persisted to a real database — refreshing the page
// clears it. That's intentional: this store exists to demo interactions,
// not to replace one.
//
// TODO (backend team): the read functions below (getCourses, getAssignments)
// already call the mock API layer in src/api/ — swap those
// for real REST calls and this context barely has to change. The mutation
// functions (addCourse, enrollCourse, etc.) should be updated to call the
// matching POST/PUT/DELETE endpoint and use its response instead of
// editing local state directly.
// -----------------------------------------------------------------------

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCourses(), getAssignments()]).then(
      ([courseData, assignmentData]) => {
        setCourses(courseData);
        setAssignments(assignmentData);
        setLoading(false);
      },
    );
  }, []);

  function logActivity(text) {
    setActivity((prev) =>
      [{ id: `act_${Date.now()}`, text, time: "Just now" }, ...prev].slice(
        0,
        8,
      ),
    );
  }

  // --- Courses -----------------------------------------------------------

  function addCourse(course) {
    setCourses((prev) => [course, ...prev]);
    logActivity(`New course added: "${course.title}"`);
  }

  function updateCourse(id, changes) {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...changes } : c)),
    );
  }

  function deleteCourse(id) {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }

  async function enrollCourse(id) {
    await apiEnroll(id);

    setCourses((prev) => {
      const target = prev.find((course) => course.id === id);
      if (target) logActivity(`Enrolled in "${target.title}"`);

      return prev.map((course) =>
        course.id === id ? { ...course, enrolled: true } : course,
      );
    });
  }

  function advanceCourseProgress(id, percent) {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, progress: Math.min(100, percent) } : c,
      ),
    );
  }

  /** Marks one syllabus week as done and recalculates the course's progress %. */
  function completeLesson(courseId, week) {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const syllabus = c.syllabus.map((item) =>
          item.week === week ? { ...item, done: true } : item,
        );
        const doneCount = syllabus.filter((item) => item.done).length;
        const progress = syllabus.length
          ? Math.round((doneCount / syllabus.length) * 100)
          : c.progress;
        const lesson = syllabus.find((item) => item.week === week);
        if (lesson)
          logActivity(`Completed lesson "${lesson.title}" in ${c.title}`);
        return { ...c, syllabus, progress };
      }),
    );
  }

  // --- Assignments ---------------------------------------------------------

  function addAssignment(assignment) {
    setAssignments((prev) => [assignment, ...prev]);
    logActivity(`New assignment added: "${assignment.title}"`);
  }

  function updateAssignment(id, changes) {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...changes } : a)),
    );
  }

  function deleteAssignment(id) {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  }

  async function submitAssignment(id, payload) {
    await apiSubmit(id, payload);
    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === id
          ? { ...assignment, status: "submitted" }
          : assignment,
      ),
    );
  }

  const value = {
    loading,
    courses,
    addCourse,
    updateCourse,
    deleteCourse,
    enrollCourse,
    advanceCourseProgress,
    completeLesson,
    assignments,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    submitAssignment,
    activity,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within a DataProvider");
  return ctx;
}
