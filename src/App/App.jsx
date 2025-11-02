import { useMemo, useState } from "react";
import Header from "../components/Header";
import ImportCard from "../ImportCard/import";
import AllocationPie from "../components/AllocationPie";
import TasksPanel from "../components/TasksPanel";
import DayTimeline from "../components/DayTimeline";
import Footer from "../components/Footer";

function App() {
  const [eventsByDate, setEventsByDate] = useState({});
  const [selectedDateISO, setSelectedDateISO] = useState("");
  const [tasksByDate, setTasksByDate] = useState({});

  const hasCalendar = Object.keys(eventsByDate).length > 0;

  const dayEvents = useMemo(
    () => (selectedDateISO ? eventsByDate[selectedDateISO] || [] : []),
    [eventsByDate, selectedDateISO]
  );

  const busyMinutes = useMemo(() => {
    if (!selectedDateISO) return 0;
    const ivs = clampToDay(dayEvents, selectedDateISO);
    const merged = mergeOverlaps(ivs);
    return totalMinutes(merged);
  }, [dayEvents, selectedDateISO]);

  const dayIntervals = useMemo(() => {
    const ivs = clampToDay(dayEvents, selectedDateISO);
    return mergeOverlaps(ivs);
  }, [dayEvents, selectedDateISO]);

  const tasks = useMemo(
    () => (selectedDateISO ? tasksByDate[selectedDateISO] || [] : []),
    [tasksByDate, selectedDateISO]
  );

  const tasksMinutes = useMemo(
    () => tasks.reduce((s, t) => s + (Number(t.minutes) || 0), 0),
    [tasks]
  );

// Intervals for planned tasks (startMin + minutes), clamped to the day
const taskIntervals = useMemo(() => {
  return (tasks || [])
    .filter(
      (t) =>
        Number.isFinite(t.startMin) &&
        Number.isFinite(t.minutes) &&
        t.minutes > 0
    )
    .map((t) => {
      const start = Math.max(0, t.startMin);
      const end = Math.min(24 * 60, t.startMin + t.minutes);
      return end > start ? { startMin: start, endMin: end } : null;
    })
    .filter(Boolean);
}, [tasks]);


  function addTask(task) {
    if (!selectedDateISO) return;
    setTasksByDate((prev) => ({
      ...prev,
      [selectedDateISO]: [...(prev[selectedDateISO] || []), task],
    }));
  }

  function removeTask(taskId) {
    if (!selectedDateISO) return;
    setTasksByDate((prev) => ({
      ...prev,
      [selectedDateISO]: (prev[selectedDateISO] || []).filter((t) => t.id !== taskId),
    }));
  }

  return (
    <>
      <Header />
      <main className="px-4 pb-12">
        {!hasCalendar ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <ImportCard
              onParsed={(data) => {
                const map = isMapShape(data) ? data : groupByDate(data);
                setEventsByDate(map);
                const today = new Date().toISOString().slice(0, 10);
                setSelectedDateISO(map[today] ? today : Object.keys(map)[0] || "");
              }}
            />
          </div>
        ) : (
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Toolbar */}
            <div className="card p-4">
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-slate-600">Pick a date:</label>
                <input
                  type="date"
                  className="field"
                  value={selectedDateISO}
                  onChange={(e) => setSelectedDateISO(e.target.value)}
                  list="available-dates"
                />
                <datalist id="available-dates">
                  {Object.keys(eventsByDate).sort().map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>

                <div className="ml-auto flex items-center gap-2">
                  <span className="pill">Events <b>{dayEvents.length}</b></span>
                  <span className="pill">Busy <b>{(busyMinutes / 60).toFixed(2)}h</b></span>
                  <span className="pill">
                    Free <b>{((24 * 60 - busyMinutes - tasksMinutes) / 60).toFixed(2)}h</b>
                  </span>
                </div>
              </div>
            </div>

            {/* Row: Pie + Tasks */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-2">
                <div className="card p-4">
                  <AllocationPie busyMinutes={busyMinutes} tasksMinutes={tasksMinutes} />
                </div>
              </div>
              <div className="md:col-span-3">
                <div className="card p-4">
                  <TasksPanel tasks={tasks} onAddTask={addTask} onRemoveTask={removeTask} />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="card p-4">
              <DayTimeline intervals={dayIntervals} taskIntervals={taskIntervals} />
            </div>

            {/* Events */}
            <div className="card p-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {selectedDateISO} — Events
              </h2>
              {dayEvents.length === 0 ? (
                <p className="text-sm text-slate-500 mt-1">No events on this day.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {dayEvents
                    .slice()
                    .sort((a, b) => a.start - b.start)
                    .map((ev, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:bg-slate-50 transition"
                      >
                        <span className="text-slate-900">{ev.title || "Event"}</span>
                        <span className="tabular-nums text-sm text-slate-600">
                          {fmt12(ev.start)} – {fmt12(ev.end)}
                        </span>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

/* ----------------- Helpers ----------------- */
function isMapShape(x) {
  return x && typeof x === "object" && !Array.isArray(x);
}
function groupByDate(events) {
  const map = {};
  for (const ev of events) {
    let cursor = new Date(ev.start);
    cursor.setHours(0, 0, 0, 0);
    const end = new Date(ev.end);
    while (cursor <= end) {
      const dayISO = cursor.toISOString().slice(0, 10);
      const s = new Date(Math.max(ev.start.getTime(), new Date(dayISO + "T00:00:00").getTime()));
      const e = new Date(Math.min(ev.end.getTime(), new Date(dayISO + "T23:59:59.999").getTime()));
      if (e > s) (map[dayISO] ||= []).push({ start: s, end: e, title: ev.title || "Event" });
      cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    }
  }
  return map;
}
function fmt12(d) {
  let h = d.getHours();
  const m = d.getMinutes();
  const am = h < 12;
  if (h === 0) h = 12;
  if (h > 12) h -= 12;
  return `${h}:${String(m).padStart(2, "0")} ${am ? "AM" : "PM"}`;
}
function clampToDay(events, dateISO) {
  if (!dateISO) return [];
  const dayStart = new Date(dateISO + "T00:00:00").getTime();
  const dayEnd = new Date(dateISO + "T23:59:59.999").getTime();
  return events
    .map((ev) => ({
      startMin: Math.max(0, Math.round((Math.max(ev.start.getTime(), dayStart) - dayStart) / 60000)),
      endMin: Math.min(
        24 * 60,
        Math.round((Math.min(ev.end.getTime(), dayEnd) - dayStart) / 60000)
      ),
    }))
    .filter((iv) => iv.endMin > iv.startMin);
}
function mergeOverlaps(intervals) {
  const sorted = intervals.slice().sort((a, b) => a.startMin - b.startMin);
  const out = [];
  for (const iv of sorted) {
    const last = out[out.length - 1];
    if (!last || iv.startMin > last.endMin) out.push({ ...iv });
    else last.endMin = Math.max(last.endMin, iv.endMin);
  }
  return out;
}
function totalMinutes(intervals) {
  return intervals.reduce((s, iv) => s + (iv.endMin - iv.startMin), 0);
}
export default App;
