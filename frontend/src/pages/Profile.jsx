import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const emptyPasswords = { currentPassword: '', newPassword: '', confirmPassword: '' };

function formatDate(value, opts) {
  return value ? new Date(value).toLocaleDateString(undefined, opts) : '—';
}

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth();
  const [form, setForm] = useState({ name: user.name, email: user.email, bio: user.bio || '' });
  const [status, setStatus] = useState({ saving: false, saved: false, error: '' });
  const [passwords, setPasswords] = useState(emptyPasswords);
  const [pwStatus, setPwStatus] = useState({ saving: false, saved: false, error: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePwChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus({ saving: true, saved: false, error: '' });
    try {
      await updateProfile({ name: form.name.trim(), email: form.email.trim(), bio: form.bio });
      setStatus({ saving: false, saved: true, error: '' });
      setTimeout(() => setStatus((s) => ({ ...s, saved: false })), 2000);
    } catch (err) {
      setStatus({ saving: false, saved: false, error: err.message });
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 8) {
      setPwStatus({ saving: false, saved: false, error: 'New password must be at least 8 characters.' });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwStatus({ saving: false, saved: false, error: 'New passwords do not match.' });
      return;
    }
    setPwStatus({ saving: true, saved: false, error: '' });
    try {
      await changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords(emptyPasswords);
      setPwStatus({ saving: false, saved: true, error: '' });
    } catch (err) {
      setPwStatus({ saving: false, saved: false, error: err.message });
    }
  };

  return (
    <DashboardLayout variant={user.role === 'admin' ? 'admin' : 'student'}>
      <h1 style={{ fontSize: '1.6rem' }}>Profile</h1>
      <p className="muted" style={{ marginBottom: 28 }}>
        Manage your account details.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 28, alignItems: 'start' }}>
        <div className="card card-pad" style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: '50%',
              background: 'var(--emerald)',
              color: 'var(--cream)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              fontWeight: 600,
              margin: '0 auto 16px',
            }}
          >
            {user.avatarInitials}
          </div>
          <h3 style={{ fontSize: '1.1rem' }}>{user.name}</h3>
          <p className="muted" style={{ fontSize: '0.88rem', textTransform: 'capitalize' }}>{user.role}</p>
          <p className="muted" style={{ fontSize: '0.8rem' }}>
            Joined {formatDate(user.createdAt || user.joined, { month: 'long', year: 'numeric' })}
          </p>
          <p className="muted" style={{ fontSize: '0.8rem' }}>
            Last login {formatDate(user.lastLogin, { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          {user.bio && <p style={{ fontSize: '0.88rem', marginTop: 12 }}>{user.bio}</p>}
        </div>

        <div style={{ display: 'grid', gap: 28 }}>
          <div className="card card-pad">
            <h3 style={{ fontSize: '1.05rem' }}>Account details</h3>
            <form onSubmit={handleSave} className="mt-16">
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input id="name" name="name" type="text" required value={form.name} onChange={handleChange} />
              </div>
              <div className="field">
                <label htmlFor="email">Email address</label>
                <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
              </div>
              <div className="field">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  maxLength={500}
                  placeholder="Tell us a little about yourself"
                  value={form.bio}
                  onChange={handleChange}
                />
              </div>
              {status.error && (
                <p role="alert" style={{ color: 'var(--danger)', fontSize: '0.88rem' }}>
                  {status.error}
                </p>
              )}
              <button className="btn btn-primary" type="submit" disabled={status.saving}>
                {status.saving ? 'Saving…' : 'Save changes'}
              </button>
              {status.saved && (
                <span className="muted" style={{ marginLeft: 12, fontSize: '0.85rem' }}>
                  Saved.
                </span>
              )}
            </form>
          </div>

          <div className="card card-pad">
            <h3 style={{ fontSize: '1.05rem' }}>Change password</h3>
            <p className="muted" style={{ fontSize: '0.85rem' }}>
              Changing your password signs you out on every other device.
            </p>
            <form onSubmit={handlePasswordSave} className="mt-16">
              <div className="field">
                <label htmlFor="currentPassword">Current password</label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={passwords.currentPassword}
                  onChange={handlePwChange}
                />
              </div>
              <div className="field">
                <label htmlFor="newPassword">New password</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  value={passwords.newPassword}
                  onChange={handlePwChange}
                />
              </div>
              <div className="field">
                <label htmlFor="confirmPassword">Confirm new password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={passwords.confirmPassword}
                  onChange={handlePwChange}
                />
              </div>
              {pwStatus.error && (
                <p role="alert" style={{ color: 'var(--danger)', fontSize: '0.88rem' }}>
                  {pwStatus.error}
                </p>
              )}
              <button className="btn btn-primary" type="submit" disabled={pwStatus.saving}>
                {pwStatus.saving ? 'Updating…' : 'Update password'}
              </button>
              {pwStatus.saved && (
                <span className="muted" style={{ marginLeft: 12, fontSize: '0.85rem' }}>
                  Password updated.
                </span>
              )}
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
