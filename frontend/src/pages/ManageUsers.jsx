import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getAllUsers, createUser, updateUser, deleteUser } from '../api/users';

// Admin user management, backed by /api/users (admin-only on the server).

const roles = ['student', 'instructor', 'admin'];
const emptyForm = { name: '', email: '', role: 'student', password: '', isActive: 'true' };

export default function ManageUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch((err) => setPageError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openModal = (u = null) => {
    setEditingId(u?.id ?? null);
    setForm(u ? { name: u.name, email: u.email, role: u.role, password: '', isActive: String(u.isActive) } : emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const replaceUser = (updated) => setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editingId) {
        const changes = {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          isActive: form.isActive === 'true',
        };
        if (form.password) changes.password = form.password;
        replaceUser(await updateUser(editingId, changes));
      } else {
        const created = await createUser({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        });
        setUsers((prev) => [created, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (u) => {
    setPageError('');
    setBusyId(u.id);
    try {
      replaceUser(await updateUser(u.id, { isActive: !u.isActive }));
    } catch (err) {
      setPageError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Permanently delete ${u.name} (${u.email})?`)) return;
    setPageError('');
    setBusyId(u.id);
    try {
      await deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (err) {
      setPageError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const q = search.toLowerCase();
  const filtered = users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  const isSelf = (id) => id === me?.id;

  return (
    <DashboardLayout variant="admin">
      <div className="page-title-row">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Manage Users</h1>
          <p className="muted">
            {loading ? 'Loading users…' : `${users.length} user${users.length === 1 ? '' : 's'} registered on the platform.`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="search-bar">
            <span aria-hidden="true">&#128269;</span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="button" onClick={() => openModal()}>
            Add New User
          </button>
        </div>
      </div>

      {pageError && (
        <p role="alert" style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>
          {pageError}
        </p>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="muted" style={{ textAlign: 'center' }}>
                  {users.length === 0 ? 'No one has registered yet.' : 'No users match your search.'}
                </td>
              </tr>
            )}
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  {u.name}
                  {isSelf(u.id) && <span className="muted" style={{ fontSize: '0.8rem' }}> (you)</span>}
                </td>
                <td>{u.email}</td>
                <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                <td>
                  <span className={`badge ${u.isActive ? 'badge-completed' : 'badge-overdue'}`}>
                    {u.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td>{u.joined}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn btn-ghost btn-sm" type="button" onClick={() => openModal(u)}>
                      Edit
                    </button>
                    {!isSelf(u.id) && (
                      <>
                        <button
                          className="btn btn-ghost btn-sm"
                          type="button"
                          disabled={busyId === u.id}
                          onClick={() => handleToggleActive(u)}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          type="button"
                          disabled={busyId === u.id}
                          onClick={() => handleDelete(u)}
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>{editingId ? 'Edit User' : 'Add New User'}</h3>
              <button className="modal-close" type="button" aria-label="Close" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input id="name" name="name" type="text" required placeholder="e.g. Priya Nambiar" value={form.name} onChange={handleChange} />
              </div>
              <div className="field">
                <label htmlFor="email">Email address</label>
                <input id="email" name="email" type="email" required placeholder="e.g. priya@example.com" value={form.email} onChange={handleChange} />
              </div>
              <div className="field">
                <label htmlFor="password">{editingId ? 'New password' : 'Temporary password'}</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required={!editingId}
                  minLength={8}
                  placeholder={editingId ? 'Leave blank to keep the current password' : 'At least 8 characters'}
                  value={form.password}
                  onChange={handleChange}
                />
                <p className="field-hint">
                  {editingId
                    ? 'Setting a new password signs this user out everywhere.'
                    : 'Share it with the user; they can change it from their Profile page.'}
                </p>
              </div>
              <div className="field">
                <label htmlFor="role">Role</label>
                <select id="role" name="role" value={form.role} onChange={handleChange} disabled={isSelf(editingId)}>
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
                {isSelf(editingId) && <p className="field-hint">You can&rsquo;t change your own role.</p>}
              </div>
              {editingId && !isSelf(editingId) && (
                <div className="field">
                  <label htmlFor="isActive">Status</label>
                  <select id="isActive" name="isActive" value={form.isActive} onChange={handleChange}>
                    <option value="true">Active</option>
                    <option value="false">Deactivated (cannot log in)</option>
                  </select>
                </div>
              )}
              {formError && (
                <p role="alert" style={{ color: 'var(--danger)', fontSize: '0.88rem' }}>
                  {formError}
                </p>
              )}
              <div className="modal-actions">
                <button className="btn btn-ghost" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
