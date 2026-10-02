import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <h4>Coursewright</h4>
          <p style={{ opacity: 0.75, maxWidth: '32ch', fontSize: '0.88rem' }}>
            A learning management system built by students, for students. This is a college
            major-project demo interface.
          </p>
        </div>
        <div>
          <h4>Learn</h4>
          <Link to="/courses">Browse Courses</Link>
          <Link to="/my-courses">My Courses</Link>
          <Link to="/assignments">Assignments</Link>
        </div>
        <div>
          <h4>Account</h4>
          <Link to="/login">Log in</Link>
          <Link to="/register">Register</Link>
          <Link to="/profile">Profile</Link>
        </div>
        <div>
          <h4>Admin</h4>
          <Link to="/admin">Admin Dashboard</Link>
          <Link to="/admin/users">Manage Users</Link>
          <Link to="/admin/courses">Manage Courses</Link>
        </div>
      </div>
      <p className="footer-bottom">Built as a Major Project &mdash; Frontend UI/UX module.</p>
    </footer>
  );
}
