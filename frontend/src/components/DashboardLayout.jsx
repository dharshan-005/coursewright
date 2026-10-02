import Navbar from './Navbar.jsx';
import AdminNavbar from './AdminNavbar.jsx';

// Wraps pages that use the app chrome. There is a single navigation format
// across the app — the top bar — so logged-in pages don't also show a
// sidebar duplicating the same links.
// variant: 'student' | 'admin' — picks which top bar to render, so the
// Admin area stays visually and navigationally separate from the student
// area (different top bar, no shared nav links).
export default function DashboardLayout({ children, variant = 'student' }) {
  const TopBar = variant === 'admin' ? AdminNavbar : Navbar;
  return (
    <div className="app-shell">
      <TopBar />
      <div className="main-content container">{children}</div>
    </div>
  );
}