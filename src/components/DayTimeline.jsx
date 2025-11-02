export default function DayTimeline({ intervals, taskIntervals = [] }) {
  // intervals: calendar busy [{startMin, endMin}]
  // taskIntervals: tasks with time [{startMin, endMin}]
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Day Timeline</h3>

      <div className="relative h-8 rounded bg-slate-100 overflow-hidden">
        {/* calendar busy (pink) */}
        {intervals.map((iv, i) => (
          <Bar key={`cal-${i}`} iv={iv} className="bg-rose-400/70" />
        ))}
        {/* tasks (blue) */}
        {taskIntervals.map((iv, i) => (
          <Bar key={`task-${i}`} iv={iv} className="bg-sky-400/80" />
        ))}
      </div>

      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>12 AM</span>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Pink = Calendar busy · Blue = Tasks (timed)
      </p>
    </div>
  );
}

function Bar({ iv, className }) {
  const left = (iv.startMin / 1440) * 100;
  const width = (Math.max(0, iv.endMin - iv.startMin) / 1440) * 100;
  return (
    <div
      className={`absolute top-0 bottom-0 ${className}`}
      style={{ left: `${left}%`, width: `${width}%` }}
      title={`${fmt12(iv.startMin)}–${fmt12(iv.endMin)}`}
    />
  );
}

function fmt12(m) {
  let h24 = Math.floor(m / 60);
  const min = m % 60;
  const am = h24 < 12;
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${String(min).padStart(2, "0")} ${am ? "AM" : "PM"}`;
}
