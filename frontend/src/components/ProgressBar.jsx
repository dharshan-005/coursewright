export default function ProgressBar({ value = 0 }) {
  const number = Number(value);
  const safeValue = Number.isFinite(number)
    ? Math.max(0, Math.min(100, number))
    : 0;

  return (
    <div>
      <div className="flex-between">
        <span>Progress</span>
        <span>{safeValue}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}
