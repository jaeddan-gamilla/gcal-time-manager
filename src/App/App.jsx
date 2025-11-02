import { useMemo, useState } from "react";
import Header from "./Header";
import ImportCard from "../ImportCard/import";
import AllocationPie from "../components/AllocationPie";
import TasksPanel from "../components/TasksPanel";
import DayTimeline from "../components/DayTimeline";

function App() {
  // Calendar data: { "YYYY-MM-DD": [{ start: Date, end: Date, title }] }
  const [eventsByDate, setEventsByDate] = useState({});
  // Selected day (YYYY-MM-DD)
  const [selectedDateISO, setSelectedDateISO] = useState("");
  // Tasks per day: { "YYYY-MM-DD": [{ id, name, minutes, startMin? }] }
  const [tasksByDate, setTasksByDate] = useState({});

  const hasCalendar = Object.keys(eventsByDate).length > 0;

  // Events for selected day
  const dayEvents = useMemo(() => {
    if (!selectedDateISO) return [];
    return eventsByDate[selectedDateISO] || [];
  }, [eventsByDate, selectedDateISO]);

  // Busy minutes from calendar for the selected day
  const busyMinutes = useMemo(() => {
    if (!selectedDateISO) return 0;
    const ivs = clampToDay(dayEvents, selectedDateISO);
    const merged = mergeOverlaps(ivs);
    return totalMinutes(merged);
  }, [dayEvents, selectedDateISO]);

  // Intervals (merged) for the 24h timeline (calendar)
  const dayIntervals = useMemo(() => {
    const ivs = clampToDay(dayEvents, selectedDateISO);
    return mergeOverlaps(ivs);
  }, [dayEvents, selectedDateISO]);

  // Tasks for the selected day
  const tasks = useMemo(() => {
    if (!selectedDateISO) return [];
    return tasksByDate[selectedDateISO] || [];
  }, [tasksByDate, selectedDateISO]);

  // Sum of task minutes
  const tasksMinutes = useMemo(
    () => tasks.reduce((s, t) => s + (Number(t.minutes) || 0), 0),
    [tasks]
  );

  // Convert tasks with a start time into timeline bars
  const taskIntervals = useMemo(() => {
    return tasks
      .filter((t) => Number.isFinite(t.startMin))
      .map((t) => {
        const startMin = Math.max(0, Math.min(1439, Number(t.startMin)));
        const endMin = Math.max(startMin, Math.min(1440, startMin + (Number(t.minutes) || 0)));
        return { startMin, endMin };
      });
  }, [tasks]);

  // Task mutators
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

      <main className="w-screen px-4 py-8">
        {!hasCalendar ? (
          // -------- Import first --------
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
          // -------- Dashboard for selected day --------
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Date picker + counts */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-600">Pick a date:</label>
                <input
                  type="date"
                  className="rounded border border-slate-300 px-3 py-1.5"
                  value={selectedDateISO}
                  onChange={(e) => setSelectedDateISO(e.target.value)}
                  list="available-dates"
                />
                <datalist id="available-dates">
                  {Object.keys(eventsByDate)
                    .sort()
                    .map((d) => (
                      <option key={d} value={d} />
                    ))}
                </datalist>

                <div className="ml-auto text-sm text-slate-600">
                  Events: <b>{dayEvents.length}</b> · Busy:{" "}
                  <b>{(busyMinutes / 60).toFixed(2)}h</b> · Free:{" "}
                  <b>{((24 * 60 - busyMinutes - tasksMinutes) / 60).toFixed(2)}h</b>
                </div>
              </div>
            </div>

            {/* Row: Pie + Tasks */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-2">
                <AllocationPie busyMinutes={busyMinutes} tasksMinutes={tasksMinutes} />
              </div>
              <div className="md:col-span-3">
                <TasksPanel tasks={tasks} onAddTask={addTask} onRemoveTask={removeTask} />
              </div>
            </div>

            {/* Timeline: calendar (pink) + tasks (blue) */}
            <DayTimeline intervals={dayIntervals} taskIntervals={taskIntervals} />

            {/* Events list */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">{selectedDateISO} — Events</h2>
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
                        className="flex items-center justify-between rounded border border-slate-200 p-2"
                      >
                        <span className="text-slate-800">{ev.title || "Event"}</span>
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
    </>
  );
}

/* ----------------- Helpers (unchanged) ----------------- */

// If your ImportCard already returns { "YYYY-MM-DD": CalEvent[] }
function isMapShape(x) {
  return x && typeof x === "object" && !Array.isArray(x);
}

// If you instead got a flat array: [{start: Date, end: Date, title}]
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
      if (e > s) {
        (map[dayISO] ||= []).push({ start: s, end: e, title: ev.title || "Event" });
      }
      cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    }
  }
  return map;
}

function fmt12(d) {
  let h = d.getHours();
  const m = d.getMinutes();
  const am = h < 12;
  h = h % 12;
  if (h === 0) h = 12;
  const mm = String(m).padStart(2, "0");
  return `${h}:${mm}${am ? "am" : "pm"}`; // no space before am/pm
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
