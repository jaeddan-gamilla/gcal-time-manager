import { useState } from "react";

function uid() {
  return Math.random().toString(36).slice(2);
}

function toMinutesFrom12h(h12, m, meridiem) {
  // Accept 0–12, treat 0 as 12
  let h = Number(h12);
  if (!Number.isFinite(h)) h = 12;
  if (h < 0) h = 0;
  if (h > 12) h = 12;

  const min = Math.max(0, Math.min(59, Number(m)));
  const base = (h === 0 ? 12 : h) % 12;
  const hours24 = base + (meridiem === "PM" ? 12 : 0);
  return hours24 * 60 + min;
}

function format12h(mins) {
  if (!Number.isFinite(mins)) return "—";
  let h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const am = h24 < 12;
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${String(m).padStart(2, "0")} ${am ? "AM" : "PM"}`;
}

function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

export default function TasksPanel({ tasks, onAddTask, onRemoveTask }) {
  const [name, setName] = useState("");
  const [startHour, setStartHour] = useState("");
  const [startMin, setStartMin] = useState("");
  const [ampm, setAmpm] = useState("AM");
  const [durHours, setDurHours] = useState("");
  const [durMinutes, setDurMinutes] = useState("");

  const totalPlanned = tasks.reduce((s, t) => s + (Number(t.minutes) || 0), 0);

  const canAdd = (() => {
    const nameOk = name.trim().length > 0;
    const hOk = /^\d+$/.test(startHour) && +startHour >= 0 && +startHour <= 12;
    const mOk = /^\d+$/.test(startMin) && +startMin >= 0 && +startMin <= 59;
    const dhOk = /^\d+$/.test(durHours) && +durHours >= 0;
    const dmOk = /^\d+$/.test(durMinutes) && +durMinutes >= 0 && +durMinutes < 60;
    const dur = +durHours * 60 + +durMinutes;
    return nameOk && hOk && mOk && dhOk && dmOk && dur > 0;
  })();

  const handleAdd = (e) => {
    e.preventDefault();
    if (!canAdd) return;
    const startMinTotal = toMinutesFrom12h(startHour, startMin, ampm);
    const minutes = +durHours * 60 + +durMinutes;
    onAddTask({
      id: uid(),
      name: name.trim(),
      minutes,
      startMin: startMinTotal,
    });
    setName("");
    setDurHours("");
    setDurMinutes("");
    setStartHour("");
    setStartMin("");
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Tasks</h3>
        <div className="text-sm text-slate-600">
          Total: {(totalPlanned / 60).toFixed(2)}h
        </div>
      </div>

      <form onSubmit={handleAdd} className="mt-3 flex flex-wrap items-center gap-3">
        <input
          className="field flex-1 min-w-[220px]"
          placeholder="Task name (e.g., EECS 370)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="12"
            className="field w-16 text-center"
            value={startHour}
            onChange={(e) => {
              const v = Math.max(0, Math.min(12, +e.target.value || 0));
              setStartHour(String(v));
            }}
          />
          :
          <input
            type="number"
            min="0"
            max="59"
            className="field w-16 text-center"
            value={startMin}
            onChange={(e) => {
              const val = Math.min(Math.max(0, +e.target.value), 59);
              setStartMin(String(val).padStart(2, "0"));
            }}
          />
          <select
            className="field w-20"
            value={ampm}
            onChange={(e) => setAmpm(e.target.value)}
          >
            <option>AM</option>
            <option>PM</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            className="field w-20 text-center"
            placeholder="hrs"
            value={durHours}
            onChange={(e) => setDurHours(e.target.value)}
          />
          <input
            type="number"
            min="0"
            max="59"
            className="field w-20 text-center"
            placeholder="min"
            value={durMinutes}
            onChange={(e) => {
              const val = Math.min(Math.max(0, +e.target.value), 59);
              setDurMinutes(String(val).padStart(2, "0"));
            }}
          />
        </div>

        <button disabled={!canAdd} className="btn-primary">
          Add
        </button>
      </form>

      {tasks.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">
          No tasks yet. Add one above.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-200">
          {tasks.map((t) => (
            <li key={t.id} className="py-2 flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-900">{t.name}</div>
                <div className="text-sm text-slate-600">
                  {Number.isFinite(t.startMin)
                    ? `${format12h(t.startMin)} · `
                    : ""}
                  {formatDuration(t.minutes)}
                </div>
              </div>
              <button
                onClick={() => onRemoveTask(t.id)}
                className="text-sm rounded border border-slate-300 px-2 py-1 hover:bg-slate-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
