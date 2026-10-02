export default function StatCard({ label, value, accent = false }) {
  return (
    <div className={`stat-card ${accent ? 'accent' : ''}`}>
      <span className="stat-num">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
