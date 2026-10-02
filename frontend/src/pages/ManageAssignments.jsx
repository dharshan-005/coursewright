import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useData } from '../context/DataContext.jsx';

const emptyForm = { title: '', course: '', description: '', deadline: '' };

export default function ManageAssignments() {
  const { assignments, courses, addAssignment, updateAssignment, deleteAssignment } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, course: courses[0]?.title || '' });
    setShowModal(true);
  };

  const handleOpenEdit = (a) => {
    setEditingId(a.id);
    setForm({ title: a.title, course: a.course, description: a.description, deadline: a.deadline });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    // TODO (backend team): wire this up to a real "delete assignment" endpoint.
    deleteAssignment(id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      // TODO (backend team): replace with a real PUT /assignments/:id call.
      updateAssignment(editingId, {
        title: form.title.trim() || 'Untitled Assignment',
        course: form.course,
        description: form.description.trim(),
        deadline: form.deadline,
      });
    } else {
      // TODO (backend team): replace with a real POST /assignments call.
      addAssignment({
        id: `a_${Date.now()}`,
        title: form.title.trim() || 'Untitled Assignment',
        course: form.course,
        description: form.description.trim(),
        deadline: form.deadline || new Date().toISOString().slice(0, 10),
        status: 'pending',
      });
    }
    setShowModal(false);
  };

  return (
    <DashboardLayout variant="admin">
      <div className="page-title-row">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Manage Assignments</h1>
          <p className="muted">{assignments.length} assignments across all courses.</p>
        </div>
        <button
          className="btn btn-primary"
          type="button"
          onClick={handleOpenAdd}
          disabled={courses.length === 0}
          title={courses.length === 0 ? 'Add a course first' : undefined}
        >
          Add New Assignment
        </button>
      </div>

      {courses.length === 0 && (
        <p className="muted" style={{ marginBottom: 16 }}>
          You'll need at least one course before you can add an assignment. Head over to{' '}
          <Link to="/admin/courses">Manage Courses</Link> to add one.
        </p>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Course</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 && (
              <tr>
                <td colSpan={5} className="muted" style={{ textAlign: 'center' }}>
                  No assignments yet.
                </td>
              </tr>
            )}
            {assignments.map((a) => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td>{a.course}</td>
                <td>{a.deadline}</td>
                <td>
                  <StatusBadge status={a.status} />
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" type="button" onClick={() => handleOpenEdit(a)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      type="button"
                      onClick={() => handleDelete(a.id)}
                    >
                      Remove
                    </button>
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
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>
                {editingId ? 'Edit Assignment' : 'Add New Assignment'}
              </h3>
              <button
                className="modal-close"
                type="button"
                aria-label="Close"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="title">Assignment title</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Final Project Proposal"
                  value={form.title}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="course">Course</label>
                <select id="course" name="course" value={form.course} onChange={handleChange}>
                  {courses.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="What should students submit?"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="deadline">Deadline</label>
                <input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={handleChange}
                />
              </div>
              <div className="modal-actions">
                <button className="btn btn-ghost" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit">
                  {editingId ? 'Save Changes' : 'Add Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
