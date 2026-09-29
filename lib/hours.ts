// Tiny parser for the common OSM opening_hours forms:
//   "24/7", "Mo-Su 08:00-22:00", "Mo-Th 10:00-23:00; Fr-Su 12:00-05:00", "Mo,We 09:00-17:00"
// Anything it can't read returns { known: false } and the UI simply hides hours.

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type Rule = { days: number[]; from: number; to: number; label: string; hours: string };

function fmt(mins: number) {
  const m = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, "0");
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm} ${ampm}`;
}

function parseDays(s: string): number[] | null {
  const out: number[] = [];
  for (const part of s.split(",")) {
    const [a, b] = part.split("-");
    const i = DAYS.indexOf(a as (typeof DAYS)[number]);
    if (i < 0) return null;
    if (!b) out.push(i);
    else {
      const j = DAYS.indexOf(b as (typeof DAYS)[number]);
      if (j < 0) return null;
      for (let k = i; ; k = (k + 1) % 7) {
        out.push(k);
        if (k === j) break;
      }
    }
  }
  return out;
}

function toMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function parseHours(spec?: string) {
  if (!spec) return { known: false as const };
  const s = spec.trim();
  if (s === "24/7") {
    return { known: true as const, rules: [{ days: [0, 1, 2, 3, 4, 5, 6], from: 0, to: 1440, label: "Every day", hours: "Open 24 hours" }] };
  }
  const rules: Rule[] = [];
  for (const chunk of s.split(";").map((x) => x.trim()).filter(Boolean)) {
    const m = /^([A-Za-z,\-]+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/.exec(chunk) || /^(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/.exec(chunk);
    if (!m) return { known: false as const };
    const days = m.length === 4 ? parseDays(m[1]) : [0, 1, 2, 3, 4, 5, 6];
    if (!days) return { known: false as const };
    const from = toMin(m.length === 4 ? m[2] : m[1]);
    let to = toMin(m.length === 4 ? m[3] : m[2]);
    if (to <= from) to += 1440; // past midnight
    const label = days.length === 7 ? "Every day" : days.length === 1 ? DAY_NAMES[days[0]] : `${DAY_NAMES[days[0]]} - ${DAY_NAMES[days[days.length - 1]]}`;
    rules.push({ days, from, to, label, hours: `${fmt(from)} - ${fmt(to)}` });
  }
  return { known: true as const, rules };
}

/** Open/closed right now plus a short status line like "Closes 11:00 PM". */
export function hoursStatus(spec?: string, now = new Date()) {
  const p = parseHours(spec);
  if (!p.known) return null;
  const day = (now.getDay() + 6) % 7; // Monday = 0
  const mins = now.getHours() * 60 + now.getMinutes();
  for (const r of p.rules) {
    // today's window
    if (r.days.includes(day) && mins >= r.from && mins < r.to) return { open: true, text: r.to - r.from >= 1440 ? "Open 24 hours" : `Closes ${fmt(r.to)}`, closesAt: r.to, rules: p.rules };
    // yesterday's window running past midnight
    const y = (day + 6) % 7;
    if (r.days.includes(y) && r.to > 1440 && mins < r.to - 1440) return { open: true, text: `Closes ${fmt(r.to)}`, closesAt: r.to - 1440, rules: p.rules };
  }
  const next = p.rules.find((r) => r.days.includes(day) && r.from > mins);
  return { open: false, text: next ? `Opens ${fmt(next.from)}` : "Closed today", closesAt: 0, rules: p.rules };
}

/** "Open late" = still open at 11 PM on the current day. */
export function isOpenLate(spec?: string, now = new Date()) {
  const p = parseHours(spec);
  if (!p.known) return false;
  const day = (now.getDay() + 6) % 7;
  return p.rules.some((r) => r.days.includes(day) && r.to >= 23 * 60);
}
