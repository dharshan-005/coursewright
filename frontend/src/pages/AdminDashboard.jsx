import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout.jsx';
import StatCard from '../components/StatCard.jsx';
import { useData } from '../context/DataContext.jsx';
import { getAdminDashboard } from '../api/dashboard';

// User figures come from the API (GET /api/dashboard/admin). Course and
// assignment figures still come from DataContext until those modules have
// their own endpoints.
export default function AdminDashboard() {
  const { courses, assignments } = useData();
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getAdminDashboard()
      .then((data) => !cancelled && setOverview(data))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = overview?.stats;
  const recentUsers = overview?.recentUsers ?? [];
  const signups = overview?.signupsLast7Days ?? [];
  const maxSignups = Math.max(1, ...signups.map((d) => d.count));
  const recentCourses = [...courses].slice(0, 5);
  const totalEnrollments = courses.filter((c) => c.progress > 0).length;
  const show = (value) => (stats ? value : '…');

  return (
    <DashboardLayout variant="admin">
      <h1 style={{ fontSize: '1.6rem' }}>Admin Overview</h1>
      <p className="muted" style={{ marginBottom: 28 }}>
        A snapshot of activity across the whole platform — user numbers come live from the
        database.
      </p>

      {error && (
        <div className="card card-pad" role="alert" style={{ marginBottom: 20, background: 'var(--danger-pale)', color: 'var(--danger)' }}>
          Couldn&rsquo;t load user statistics: {error}
        </div>
      )}

      <div className="grid grid-4">
        <StatCard label="Total users" value={show(stats?.totalUsers)} accent />
        <StatCard label="Total courses" value={courses.length} />
        <StatCard label="Total enrollments" value={totalEnrollments} />
        <StatCard label="Total assignments" value={assignments.length} />
      </div>

      <div className="grid grid-4 mt-16">
        <StatCard label="Students" value={show(stats?.byRole.student)} />
        <StatCard label="Instructors" value={show(stats?.byRole.instructor)} />
        <StatCard label="New users this week" value={show(stats?.newUsersThisWeek)} />
        <StatCard label="Active this week" value={show(stats?.activeThisWeek)} />
      </div>

      <div className="card card-pad mt-24">
        <div className="flex-between" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.15rem', margin: 0 }}>Sign-ups, last 7 days</h2>
          {stats && stats.inactiveUsers > 0 && (
            <span className="muted" style={{ fontSize: '0.85rem' }}>
              {stats.inactiveUsers} deactivated account{stats.inactiveUsers === 1 ? '' : 's'}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
          {signups.map((d) => (
            <div key={d.date} style={{ flex: 1, textAlign: 'center' }} title={`${d.count} on ${d.date}`}>
              <div style={{ fontSize: '0.78rem', marginBottom: 4 }}>{d.count}</div>
              <div
                style={{
                  height: `${Math.max(4, (d.count / maxSignups) * 80)}px`,
                  background: d.count ? 'var(--emerald)' : 'var(--emerald-pale)',
                  borderRadius: 4,
                }}
              />
              <div className="muted" style={{ fontSize: '0.72rem', marginTop: 6 }}>
                {new Date(`${d.date}T00:00:00Z`).toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' })}
              </div>
            </div>
          ))}
          {!signups.length && <p className="muted">{error ? 'No data.' : 'Loading…'}</p>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28, marginTop: 32 }}>
        <div>
          <div className="section-head" style={{ marginBottom: 12 }}>
            <h2 style={{ fontSize: '1.15rem' }}>Recent users</h2>
            <Link to="/admin/users" className="btn btn-ghost btn-sm">
              Manage users
            </Link>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="muted" style={{ textAlign: 'center' }}>
                      {overview ? 'No one has registered yet.' : 'Loading…'}
                    </td>
                  </tr>
                ) : (
                  recentUsers.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                      <td>{u.joined}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="section-head" style={{ marginBottom: 12 }}>
            <h2 style={{ fontSize: '1.15rem' }}>Recent courses</h2>
            <Link to="/admin/courses" className="btn btn-ghost btn-sm">
              Manage courses
            </Link>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Students</th>
                </tr>
              </thead>
              <tbody>
                {recentCourses.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="muted" style={{ textAlign: 'center' }}>
                      No courses have been added yet.
                    </td>
                  </tr>
                ) : (
                  recentCourses.map((c) => (
                    <tr key={c.id}>
                      <td>{c.title}</td>
                      <td>{c.category}</td>
                      <td>{c.students.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
