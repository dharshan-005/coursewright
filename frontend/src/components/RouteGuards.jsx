import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Route protection backed by the real session in AuthContext. The API also
// enforces every rule below (protect/authorize middleware), so these guards
// are about UX — sending people to the right page — not security.

function SessionLoading() {
  return (
    <div className="container section" style={{ textAlign: "center" }}>
      <p className="muted">Checking your session...</p>
    </div>
  );
}

// Requires any logged-in user.
export function RequireAuth({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <SessionLoading />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

// Requires a logged-in user whose server-assigned role is "admin".
export function RequireAdmin({ children }) {
  const { isAuthenticated, initializing, user } = useAuth();
  const location = useLocation();

  if (initializing) return <SessionLoading />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export function RequireInstructor({ children }) {
  const { isAuthenticated, initializing, user } = useAuth();
  const location = useLocation();

  if (initializing) return <SessionLoading />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (user.role !== "instructor") {
    return (
      <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />
    );
  }

  return children;
}

/** Where a user should land after signing in. */
export function homePathFor(user, from) {
  const roleHome = {
    admin: "/admin",
    instructor: "/instructor",
    student: "/dashboard",
  };

  if (from && !from.startsWith("/admin") && !from.startsWith("/instructor")) {
    return from;
  }

  return roleHome[user.role] || "/dashboard";
}

// For /login and /register: a signed-in user is sent on to where they were
// heading (or their dashboard) instead of seeing the form again.
export function RedirectIfAuthenticated({ children }) {
  const { isAuthenticated, initializing, user } = useAuth();
  const location = useLocation();
  if (initializing) return <SessionLoading />;
  if (isAuthenticated) {
    return <Navigate to={homePathFor(user, location.state?.from)} replace />;
  }
  return children;
}
