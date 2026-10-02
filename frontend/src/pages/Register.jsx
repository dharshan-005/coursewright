import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      // On success <RedirectIfAuthenticated> (App.jsx) moves them to their dashboard.
      await register(payload);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-side">
        <h2>Start learning at your own pace</h2>
        <p style={{ color: 'var(--champagne)', maxWidth: '34ch' }}>
          Create an account to enroll in courses, submit assignments, and track your progress.
        </p>
      </div>
      <div className="auth-form-side">
        <div className="card card-pad form-card" style={{ width: '100%' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Create an account</h2>
          <p className="muted mt-8" style={{ marginBottom: 24 }}>
            It only takes a minute to get started.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Jane Doe"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Type it again"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label htmlFor="role">I am joining as a</label>
              <select id="role" name="role" value={form.role} onChange={handleChange}>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>
              <p className="field-hint">
                Admin accounts are created by an existing admin, not through sign-up.
              </p>
            </div>
            {error && <p role="alert" style={{ color: 'var(--danger)', fontSize: '0.88rem' }}>{error}</p>}
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="muted mt-16" style={{ fontSize: '0.9rem' }}>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
