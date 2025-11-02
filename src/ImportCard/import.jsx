import React from "react";
import ICAL from "ical.js";

/**
 * Expand an ICS text into a date->events map, including recurring events.
 */
function expandIcsToMap(text, rangeStart, rangeEnd) {
  const jcal = ICAL.parse(text);
  const comp = new ICAL.Component(jcal);

  const vevents = comp.getAllSubcomponents("vevent");
  const series = new Map();
  for (const v of vevents) {
    const ev = new ICAL.Event(v);
    const uid = ev.uid || v.getFirstPropertyValue("uid");
    if (!series.has(uid)) series.set(uid, { master: null, extras: [] });
    if (ev.isRecurrenceException()) series.get(uid).extras.push(ev);
    else series.get(uid).master = ev;
  }

  for (const { master, extras } of series.values()) {
    if (!master) continue;
    const parent = master.component.parent || new ICAL.Component("vcalendar");
    if (!master.component.parent) parent.addSubcomponent(master.component);
    for (const ex of extras) parent.addSubcomponent(ex.component);
  }

  const startICAL = ICAL.Time.fromJSDate(rangeStart, true);
  const endICAL = ICAL.Time.fromJSDate(rangeEnd, true);
  const out = {};

  const push = (jsStart, jsEnd, title) => {
    let cursor = new Date(jsStart);
    cursor.setHours(0, 0, 0, 0);
    const end = new Date(jsEnd);
    while (cursor <= end) {
      const dayISO = cursor.toISOString().slice(0, 10);
      const dayStart = new Date(dayISO + "T00:00:00");
      const dayEnd = new Date(dayISO + "T23:59:59.999");
      const s = new Date(Math.max(jsStart.getTime(), dayStart.getTime()));
      const e = new Date(Math.min(jsEnd.getTime(), dayEnd.getTime()));
      if (e > s) (out[dayISO] ||= []).push({ start: s, end: e, title });
      cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    }
  };

  for (const { master } of series.values()) {
    if (!master) continue;
    const title = master.summary || "Event";

    if (master.isRecurring()) {
      const it = master.iterator();
      let next;
      while ((next = it.next())) {
        if (next.compare(endICAL) > 0) break;
        if (next.compare(startICAL) < 0) continue;
        const { startDate, endDate } = master.getOccurrenceDetails(next);
        push(startDate.toJSDate(), endDate.toJSDate(), title);
      }
    } else {
      const s = master.startDate.toJSDate();
      const e = master.endDate.toJSDate();
      if (e >= rangeStart && s <= rangeEnd) push(s, e, title);
    }
  }

  return out;
}

export default function ImportCard({ onParsed }) {
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();

    const now = new Date();
    const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const end = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const map = expandIcsToMap(text, start, end);
    onParsed(map);
  };

  return (
    <div className="max-w-xl w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
      <h1 className="text-2xl font-bold text-slate-800">Import Calendar (.ics)</h1>
      <input
        type="file"
        accept=".ics,text/calendar"
        onChange={handleFile}
        className="mt-4 w-full cursor-pointer rounded-lg border border-dashed border-slate-300 p-8"
      />
    </div>
  );
}
