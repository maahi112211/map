// HTML for Leaflet markers (Leaflet needs HTML strings). Escape all user text!

import type { Chit, Hashtag, Person, Place, PlaceCategory, Story } from "./types";

export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
const bg = (url: string | undefined, color: string) => `background-color:${esc(color)};${url ? `background-image:url('${esc(url)}')` : ""}`;

const svg = (paths: string, size = 18, extra = "") =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${paths}</svg>`;

// Lucide paths for category pins
const CAT_PATH: Record<PlaceCategory, string> = {
  coffee: '<path d="M10 2v2M14 2v2M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1M6 2v2"/>',
  restaurant: '<path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7M2.1 21.8l6.4-6.3M19 5l-7 7"/>',
  park: '<path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0ZM7 16v6M13 19v3"/><path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5"/>',
  hotel: '<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>',
  bar: '<path d="M8 22h8M7 10h10M12 15v7M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/>',
  museum: '<path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l8 5H4Z"/>',
  fuel: '<path d="M3 22h12M4 9h10M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9.8a2 2 0 0 0-.6-1.4L18 5"/>',
  atm: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/>',
  hospital: '<path d="M12 6v4M14 14h-4M14 18h-4M14 8h-4M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18"/>',
  parking: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>',
  shop: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0"/>',
  other: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
};
export const catSvg = (c: PlaceCategory, size = 18) => svg(CAT_PATH[c], size);

const BADGE = { heart: '<span style="color:#e5484d">&#10084;</span>', fries: "🍟", party: "🎉" } as const;

export function meHtml(locating = false) {
  return `<span class="mk-me${locating ? " locating" : ""}"><span class="mk-me-avatar"><img src="https://api.dicebear.com/9.x/notionists/svg?seed=me&amp;backgroundColor=d6e4f5" alt=""></span><span class="mk-me-label">You Now</span></span>`;
}

/** Story bubble; `stack` > 1 shows a second photo peeking behind. */
export function storyHtml(group: Story[], opts: { name?: boolean } = {}) {
  const s = group[0];
  const back = group[1]
    ? `<span class="ring stack"><span class="ph" style="${bg(group[1].mediaUrl, group[1].mediaColor)}"></span></span>`
    : "";
  const displayName = `${s.group === "hashtag" ? "#" : ""}${s.user.name}`;
  const label = opts.name !== false ? `<span class="mk-name">${esc(displayName)}</span>` : "";
  const badge = s.badge ? `<span class="mk-badge">${BADGE[s.badge]}</span>` : "";
  return `<span class="mk-story">${back}<span class="ring"><span class="ph" style="${bg(s.mediaUrl, s.mediaColor)}"></span></span>${label}${badge}</span>`;
}

export function chitHtml(group: Chit[], _i: number) {
  const c = group[0];
  const count = group.length > 1 ? `<span class="mk-count">${group.length}</span>` : "";
  const play = c.isVideo ? `<span class="play">${svg('<path d="M9 7v10l8-5z" fill="#fff" stroke="none"/>', 14)}</span>` : "";
  return `<span class="mk-chit-shell"><span class="mk-chit" style="${bg(c.mediaUrl, c.mediaColor)}"><span class="mk-chit-shade"></span>${play}</span>${count}</span>`;
}

export function friendHtml(p: Person) {
  return `<span class="mk-friend" style="${bg(p.avatarUrl, p.color)}"><span class="mk-name">${esc(p.name)}</span><span class="live"></span></span>`;
}

export function tagHtml(h: Hashtag, count = 1) {
  const more = count > 1 ? `<span class="mk-count">+${count - 1}</span>` : "";
  return `<span class="mk-tag" style="${bg(h.imageUrl, h.color)}"><span class="mk-tag-shade"></span><span class="mk-name">#${esc(h.name)}</span><span class="hash"><img src="/hashtag.svg" alt="" aria-hidden="true"></span>${more}</span>`;
}

export function placeHtml(p: Place, on = false) {
  const name = on ? `<span class="mk-place-name">${esc(p.name)}</span>` : "";
  return `<span class="mk-place cat-${p.category} ${on ? "on" : ""}">${name}<span class="mk-place-icon">${catSvg(p.category, on ? 20 : 18)}</span></span>`;
}

export function ratingHtml(p: Place, on = false) {
  const r = p.rating != null ? p.rating.toFixed(1) : "New";
  return `<span class="mk-rate ${on ? "on" : ""}">${catSvg(p.category, 15)}${r}</span>`;
}

export function pinHtml(c: PlaceCategory = "other") {
  return `<span class="mk-pin">${catSvg(c, 20)}</span>`;
}

/** Greedy pixel-distance clustering. */
export function clusterByPixels<T extends { location: { lat: number; lng: number } }>(items: T[], zoom: number, px = 52): T[][] {
  const scale = 256 * 2 ** zoom;
  const project = (lat: number, lng: number) => {
    const s = Math.sin((lat * Math.PI) / 180);
    return { x: ((lng + 180) / 360) * scale, y: (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * scale };
  };
  const groups: { x: number; y: number; items: T[] }[] = [];
  for (const it of items) {
    const p = project(it.location.lat, it.location.lng);
    const g = groups.find((g) => Math.hypot(g.x - p.x, g.y - p.y) < px);
    if (g) g.items.push(it);
    else groups.push({ ...p, items: [it] });
  }
  return groups.map((g) => g.items);
}
