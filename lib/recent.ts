"use client";

const KEY = "openone.recent";

export function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addRecent(q: string) {
  const t = q.trim();
  if (!t) return;
  try {
    localStorage.setItem(KEY, JSON.stringify([t, ...readRecent().filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 8)));
  } catch { /* ignore */ }
}

export function clearRecent() {
  try {
    localStorage.removeItem(KEY);
  } catch { /* ignore */ }
}
