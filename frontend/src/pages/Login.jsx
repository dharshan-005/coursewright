import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // On success the session user is set and <RedirectIfAuthenticated>
      // (App.jsx) sends them to where they were going, or to the dashboard
      // that matches the role stored on the server.
      await login(form);
    } catch (err) {
      setError(err.message || 'Could not log in. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-side">
        <h2>Welcome back to Coursewright</h2>
        <p style={{ color: 'var(--champagne)', maxWidth: '34ch' }}>
          Pick up your courses, check assignment deadlines, and keep your progress moving.
        </p>
      </div>
      <div className="auth-form-side">
        <div className="card card-pad form-card" style={{ width: '100%' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Log in</h2>
          <p className="muted mt-8" style={{ marginBottom: 24 }}>
            Enter your details to access your dashboard.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
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
                autoComplete="current-password"
                required
                placeholder="********"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            {error && (
              <p role="alert" style={{ color: 'var(--danger)', fontSize: '0.88rem' }}>{error}</p>
            )}
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
          <p className="muted mt-16" style={{ fontSize: '0.9rem' }}>
            Don&rsquo;t have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
