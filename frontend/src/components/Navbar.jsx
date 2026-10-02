import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardPath =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "instructor"
        ? "/instructor"
        : "/dashboard";

  const navItem = ({ isActive }) => (isActive ? "active" : undefined);

  function closeNav() {
    setOpen(false);
  }

  async function handleLogout() {
    setMenuOpen(false);

    try {
      await logout();
    } finally {
      navigate("/");
    }
  }

  return (
    <header className="navbar">
      <Link
        to={isAuthenticated ? dashboardPath : "/"}
        className="navbar-brand"
        onClick={closeNav}
      >
        <span className="navbar-mark">C</span>
        Coursewright
      </Link>

      <nav>
        <ul className={`navbar-links ${open ? "open" : ""}`}>
          {!isAuthenticated && (
            <li>
              <NavLink to="/" end className={navItem} onClick={closeNav}>
                Home
              </NavLink>
            </li>
          )}

          {isAuthenticated && (
            <li>
              <NavLink
                to={dashboardPath}
                className={navItem}
                onClick={closeNav}
              >
                Dashboard
              </NavLink>
            </li>
          )}

          <li>
            <NavLink to="/courses" className={navItem} onClick={closeNav}>
              Courses
            </NavLink>
          </li>

          {isAuthenticated &&
            (user?.role === "student" || user?.role === "instructor") && (
              <li>
                <NavLink
                  to="/my-courses"
                  className={navItem}
                  onClick={closeNav}
                >
                  My Courses
                </NavLink>
              </li>
            )}

          {isAuthenticated && user?.role !== "admin" && (
            <li>
              <NavLink to="/assignments" className={navItem} onClick={closeNav}>
                Assignments
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      <div className="navbar-actions">
        {!isAuthenticated ? (
          <>
            <Link to="/login" className="btn btn-champagne btn-sm">
              Log in
            </Link>
            <Link
              to="/register"
              className="btn btn-ghost btn-sm"
              style={{
                color: "var(--cream)",
                borderColor: "rgba(243,230,200,0.4)",
              }}
            >
              Sign up
            </Link>
          </>
        ) : (
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="navbar-avatar"
              style={{ border: "none", cursor: "pointer" }}
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
              aria-label="Open account menu"
              title={user?.name}
            >
              {user?.avatarInitials || "U"}
            </button>

            {menuOpen && (
              <div
                className="card"
                style={{
                  position: "absolute",
                  right: 0,
                  top: 46,
                  minWidth: 180,
                  padding: 8,
                  zIndex: 50,
                }}
              >
                <p
                  style={{
                    padding: "8px 10px",
                    margin: 0,
                    fontSize: "0.85rem",
                    color: "var(--muted)",
                  }}
                >
                  Signed in as
                  <br />
                  <strong style={{ color: "var(--ink)" }}>{user?.name}</strong>
                </p>

                <Link
                  to="/profile"
                  className="sidebar-link"
                  onClick={() => setMenuOpen(false)}
                  style={{ margin: 0 }}
                >
                  View Profile
                </Link>

                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    className="sidebar-link"
                    onClick={() => setMenuOpen(false)}
                    style={{ margin: 0 }}
                  >
                    Go to Admin Panel
                  </Link>
                )}

                <button
                  type="button"
                  className="sidebar-link"
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--danger)",
                  }}
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          className="navbar-toggle"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          &#9776;
        </button>
      </div>
    </header>
  );
}
