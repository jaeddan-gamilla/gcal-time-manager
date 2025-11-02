import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

const COLORS = ["#f43f5e", "#0ea5e9", "#10b981"]; // red-500, sky-500, emerald-500

export default function AllocationPie({ busyMinutes, tasksMinutes }) {
  const free = Math.max(0, 24 * 60 - busyMinutes - tasksMinutes);
  const data = [
    { name: "Busy (Calendar)", value: busyMinutes },
    { name: "Tasks (Planned)", value: tasksMinutes },
    { name: "Free", value: free },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-2">Day Allocation</h2>
      <PieChart width={320} height={260}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          stroke="#e2e8f0"           /* slate-200 stroke */
          strokeWidth={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>

      <div className="mt-2 text-sm text-slate-600">
        Busy: {(busyMinutes / 60).toFixed(2)}h · Tasks: {(tasksMinutes / 60).toFixed(2)}h · Free:{" "}
        {((24 * 60 - busyMinutes - tasksMinutes) / 60).toFixed(2)}h
      </div>
    </div>
  );
}
