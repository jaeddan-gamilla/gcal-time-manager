import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export default function AllocationPie({ busyMinutes, tasksMinutes }) {
  const totalDay = 24 * 60;
  const freeMinutes = Math.max(0, totalDay - busyMinutes - tasksMinutes);

  const data = [
    { name: "Busy (Calendar)", value: busyMinutes },
    { name: "Tasks (Planned)", value: tasksMinutes },
    { name: "Free", value: freeMinutes },
  ];

  const COLORS = ["#fb7185", "#60a5fa", "#34d399"]; // rose-400, blue-400, emerald-400

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Day Allocation</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              dataKey="value"
              data={data}
              innerRadius={60}
              outerRadius={100}
              stroke="#fff"
              strokeWidth={1}
            >
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => `${(v/60).toFixed(2)} h`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-sm text-slate-600">
        Busy: {(busyMinutes/60).toFixed(2)}h · Tasks: {(tasksMinutes/60).toFixed(2)}h · Free: {(freeMinutes/60).toFixed(2)}h
      </p>
    </div>
  );
}
