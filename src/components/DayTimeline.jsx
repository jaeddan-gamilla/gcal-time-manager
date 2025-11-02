export default function DayTimeline({ intervals, taskIntervals = [] }) {
  const hours = Array.from({ length: 25 }, (_, i) => i);

  const Block = ({ iv, className }) => (
    <div
      className={`absolute top-0 bottom-0 rounded-md ${className}`}
      style={{
        left: `${(iv.startMin / (24 * 60)) * 100}%`,
        width: `${((iv.endMin - iv.startMin) / (24 * 60)) * 100}%`,
      }}
    />
  );

  return (
    <>
      <h2 className="text-lg font-semibold text-slate-900 mb-3">Day Timeline</h2>

      {/* Track */}
      <div className="relative h-6 rounded-md bg-slate-200 overflow-hidden">
        {/* Calendar busy (blue) underlay */}
        {intervals.map((iv, i) => (
          <Block key={`cal-${i}`} iv={iv} className="bg-sky-500/80" />
        ))}

        {/* Planned tasks (green) overlay */}
        {taskIntervals.map((iv, i) => (
          <Block
            key={`task-${i}`}
            iv={iv}
            className="bg-emerald-500/90 ring-1 ring-emerald-600/40"
          />
        ))}
      </div>

      {/* Hour ticks */}
      <div className="flex justify-between text-xs text-slate-500 mt-2">
        {hours.map((h) => {
          const label = h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`;
          return <span key={h}>{label}</span>;
        })}
      </div>

      <p className="mt-1 text-xs text-slate-500">
        <span className="font-medium text-sky-700">Blue</span> = calendar busy ·{" "}
        <span className="font-medium text-emerald-700">Green</span> = planned tasks
      </p>
    </>
  );
}
