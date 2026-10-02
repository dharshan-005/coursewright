import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

// A completely separate top bar for /admin/*, so Admin doesn't share any
// nav links with the student-facing Navbar (no Home/Courses/Dashboard here).
// Visually distinguished with a champagne bottom border and an "Admin"
// badge next to the brand, so it's obvious at a glance which area you're in.
export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/');
  };

  const navItem = ({ isActive }) => (isActive ? 'active' : undefined);

  return (
    <header className="navbar" style={{ borderBottom: '3px solid var(--champagne)' }}>
      <Link to="/admin" className="navbar-brand">
        <span className="navbar-mark">C</span>
        Coursewright
        <span
          style={{
            marginLeft: 4,
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            background: 'var(--champagne)',
            color: 'var(--ink)',
            padding: '3px 9px',
            borderRadius: 999,
            fontFamily: 'var(--font-body)',
          }}
        >
          ADMIN
        </span>
      </Link>

      <nav>
        <ul className="navbar-links">
          <li>
            <NavLink to="/admin" end className={navItem}>
              Overview
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/users" className={navItem}>
              Manage Users
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/courses" className={navItem}>
              Manage Courses
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/assignments" className={navItem}>
              Manage Assignments
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="navbar-actions">
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="navbar-avatar"
            style={{ border: 'none', cursor: 'pointer' }}
            onClick={() => setMenuOpen((v) => !v)}
            title={user?.name}
          >
            {user?.avatarInitials}
          </button>
          {menuOpen && (
            <div
              className="card"
              style={{ position: 'absolute', right: 0, top: 46, minWidth: 190, padding: 8, zIndex: 50 }}
            >
              <p style={{ padding: '8px 10px', margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>
                Signed in as<br />
                <strong style={{ color: 'var(--ink)' }}>{user?.name}</strong>
              </p>
              <Link to="/" className="sidebar-link" onClick={() => setMenuOpen(false)} style={{ margin: 0 }}>
                Exit to Student Site
              </Link>
              <button
                type="button"
                className="sidebar-link"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--danger)',
                }}
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
