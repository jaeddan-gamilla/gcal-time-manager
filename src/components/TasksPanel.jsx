import { useState } from "react";

function uid() {
  return Math.random().toString(36).slice(2);
}

function toMinutesFrom12h(h12, m, meridiem) {
  let h = Number(h12);
  const min = Number(m);
  const isPM = meridiem === "PM";
  if (h === 12) h = 0;                 // 12 AM => 0; 12 PM handled by +12
  const hours24 = isPM ? h + 12 : h;
  return hours24 * 60 + min;
}

function format12h(mins) {
  if (!Number.isFinite(mins)) return "—";
  let h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const am = h24 < 12;
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${String(m).padStart(2, "0")}${am ? "am" : "pm"}`; // lowercase, no space
}

function durationToWords(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  const parts = [];
  if (h > 0) parts.push(`${h} ${h === 1 ? "hour" : "hours"}`);
  if (m > 0) parts.push(`${m} ${m === 1 ? "minute" : "minutes"}`);
  return parts.length ? parts.join(" and ") : "0 minutes";
}


export default function TasksPanel({ tasks, onAddTask, onRemoveTask }) {
  const [name, setName] = useState("");
  const [startHour, setStartHour] = useState("9");
  const [startMin, setStartMin] = useState("00");
  const [ampm, setAmpm] = useState("AM");
  const [durHours, setDurHours] = useState("");
  const [durMinutes, setDurMinutes] = useState("");

  const totalPlanned = tasks.reduce((s, t) => s + (Number(t.minutes) || 0), 0);

  const canAdd = (() => {
    const nameOk = name.trim().length > 0;
    const hOk = /^\d+$/.test(startHour) && +startHour >= 1 && +startHour <= 12;
    const mOk = /^\d+$/.test(startMin) && +startMin >= 0 && +startMin <= 59;
    const dhOk = /^\d+$/.test(String(durHours)) && +durHours >= 0;
    const dmOk = /^\d+$/.test(String(durMinutes)) && +durMinutes >= 0 && +durMinutes < 60;
    const dur = +durHours * 60 + +durMinutes;
    return nameOk && hOk && mOk && dhOk && dmOk && dur > 0;
  })();

  const handleAdd = (e) => {
    e.preventDefault();
    if (!canAdd) return;
    const startMinTotal = toMinutesFrom12h(startHour, startMin, ampm);
    const minutes = +durHours * 60 + +durMinutes;
    onAddTask({ id: uid(), name: name.trim(), minutes, startMin: startMinTotal });
    setName("");
    setDurHours(1);
    setDurMinutes(0);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tasks</h3>
        <div className="text-sm text-slate-600">Total: {(totalPlanned / 60).toFixed(2)}h</div>
      </div>

      {/* FLEX WRAP FORM */}
      <form onSubmit={handleAdd} className="mt-3 flex flex-wrap items-center gap-3">
        {/* Task name */}
        <input
          className="flex-1 min-w-[220px] rounded border border-slate-300 px-3 py-1.5"
          placeholder="Task name (e.g., EECS 370)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Start time */}
        <div className="flex items-center gap-2 flex-none">
          <input
            type="number"
            min="1"
            max="12"
            className="w-14 rounded border border-slate-300 px-2 py-1.5 text-center"
            value={startHour}
            onChange={(e) => setStartHour(e.target.value)}
          />
          :
          <input
            type="number"
            min="0"
            max="59"
            className="w-14 rounded border border-slate-300 px-2 py-1.5 text-center"
            value={startMin}
            onChange={(e) => {
              const val = Math.min(Math.max(0, +e.target.value), 59);
              setStartMin(String(val).padStart(2, "0"));
            }}
          />
          <select
            className="w-24 rounded border border-slate-300 px-2 py-1.5"
            value={ampm}
            onChange={(e) => setAmpm(e.target.value)}
          >
            <option>AM</option>
            <option>PM</option>
          </select>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 flex-none">
          <input
            type="number"
            min="0"
            className="w-20 rounded border border-slate-300 px-2 py-1.5 text-center"
            placeholder="hr"
            value={durHours}
            onChange={(e) => setDurHours(e.target.value)}
          />
          <input
            type="number"
            min="0"
            max="59"
            className="w-20 rounded border border-slate-300 px-2 py-1.5 text-center"
            placeholder="min"
            value={durMinutes}
            onChange={(e) => {
              const val = Math.min(Math.max(0, +e.target.value), 59);
              setDurMinutes(String(val).padStart(2, "0"));
            }}
          />
        </div>

        {/* Add button — always green */}
        <button
            disabled={!canAdd}
            className="flex-none rounded px-3 py-1.5 text-white
                        bg-emerald-600 hover:bg-emerald-700
                        disabled:bg-emerald-600 disabled:text-white
                        disabled:hover:bg-emerald-600 disabled:cursor-not-allowed"
            >
            Add
        </button>

      </form>

      {tasks.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No tasks yet. Add one above.</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-200">
          {tasks.map((t) => (
            <li key={t.id} className="py-2 flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-800">{t.name}</div>
                <div className="text-sm text-slate-500">
                  {Number.isFinite(t.startMin) ? `${format12h(t.startMin)} · ` : ""}
                  {durationToWords(t.minutes)}
                </div>
              </div>
              <button
                onClick={() => onRemoveTask(t.id)}
                className="text-sm rounded border px-2 py-1 hover:bg-slate-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
