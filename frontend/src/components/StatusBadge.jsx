const labels = {
  pending: 'Pending',
  submitted: 'Submitted',
  completed: 'Completed',
  overdue: 'Overdue',
};

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{labels[status] || status}</span>;
}
