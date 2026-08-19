export default function ProgressBar({ current, total, label }) {
  const pct = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {label && (
          <span className="text-xs font-semibold tracking-widest uppercase text-text-secondary">
            {label}
          </span>
        )}
        <span className="text-xs font-semibold text-secondary ml-auto">
          {current} / {total}
        </span>
      </div>
      <div className="w-full h-2 bg-primary bg-opacity-15 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #B8860B 0%, #C5A059 60%, #D4B87A 100%)",
          }}
        />
      </div>
    </div>
  );
}
