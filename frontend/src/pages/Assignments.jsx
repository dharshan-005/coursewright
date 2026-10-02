import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useData } from '../context/DataContext.jsx';

export default function Assignments() {
  const { assignments, loading, submitAssignment } = useData();
  const [submittingId, setSubmittingId] = useState(null);

  const handleSubmit = async (id) => {
    setSubmittingId(id);
    await submitAssignment(id);
    setSubmittingId(null);
  };

  return (
    <DashboardLayout variant="student">
      <div className="page-title-row">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Assignments</h1>
          <p className="muted">Track deadlines and submit your work.</p>
        </div>
      </div>

      {loading ? (
        <p className="muted">Loading assignments...</p>
      ) : assignments.length === 0 ? (
        <div className="empty-state">
          <h3>No assignments yet</h3>
          <p className="muted">Nothing has been assigned to your courses so far.</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {assignments.map((a) => (
            <div key={a.id} className="card card-pad">
              <div className="flex-between">
                <span className="course-category">{a.course}</span>
                <StatusBadge status={a.status} />
              </div>
              <h3 style={{ fontSize: '1.05rem', marginTop: 10 }}>{a.title}</h3>
              <p className="muted" style={{ fontSize: '0.9rem' }}>
                {a.description}
              </p>
              <div className="flex-between mt-16">
                <span className="muted" style={{ fontSize: '0.85rem' }}>
                  Due {new Date(a.deadline).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                {a.status === 'pending' || a.status === 'overdue' ? (
                  <button
                    className="btn btn-primary btn-sm"
                    type="button"
                    onClick={() => handleSubmit(a.id)}
                    disabled={submittingId === a.id}
                  >
                    {submittingId === a.id ? 'Submitting...' : 'Submit'}
                  </button>
                ) : (
                  <button className="btn btn-ghost btn-sm" type="button" disabled>
                    {a.status === 'submitted' ? 'Awaiting grade' : 'Graded'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
