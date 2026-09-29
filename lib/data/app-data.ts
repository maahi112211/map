// App data layer — stories, chits, hashtag chats, people, and your community's
// data about places (ratings, photos, friends visited).
//
// Today: sample data from ./mock.ts.
// Later: set APP_API_URL in .env.local. Every function below then calls your
// backend instead; responses must match lib/types.ts. Endpoints:
//   GET  /feed?lat&lng                      -> { stories, chits, people, hashtags }
//   GET  /stories/:id                       -> Story & { next: string[] }
//   GET  /chits/:id                         -> Chit & { next: string[] }
//   GET  /hashtags/:tag?lat&lng             -> { hashtag, chits, stories }
//   GET  /users/:username                   -> { user, chits }
//   GET  /search?q&lat&lng                  -> { people, hashtags, chits }
//   POST /places/community {ids: string[]}  -> { [placeId]: { rating, reviews, photos, friendsVisited } }
//   POST /reports {type, id, reason}        -> { ok: true }

import { distanceKm, offset } from "../geo";
import { hoursStatus, isOpenLate } from "../hours";
import type { Chit, Filters, Hashtag, LatLng, Person, Place, PlaceCategory, Story, User } from "../types";
import { avatar, CHIT_SEEDS, HASHTAG_SEEDS, PEOPLE_SEEDS, photo, STORY_SEEDS, USERS } from "./mock";
import { categoryFromQuery, geocodeLocation, getNearbyPlaces, getPlace, searchPlaces, type RawPlace } from "./places";

const API = process.env.APP_API_URL;

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, { cache: "no-store", ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
  if (!res.ok) throw new Error(`App API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}
const ll = (c: LatLng) => `lat=${c.lat}&lng=${c.lng}`;

// ---------- helpers ----------
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

function toUser(id: string): User {
  const s = USERS.find((u) => u.id === id)!;
  return { ...s, avatarUrl: s.avatarUrl || avatar(s.username) };
}
export const allUsers = () => USERS.map((u) => toUser(u.id));

function nearestPlace(loc: LatLng, places: RawPlace[]) {
  let best: RawPlace | null = null;
  let d = 0.25;
  for (const p of places) {
    const x = distanceKm(loc, p.location);
    if (x < d) { best = p; d = x; }
  }
  return best;
}

function stories(center: LatLng, places: RawPlace[] = []): Story[] {
  return STORY_SEEDS.map((s) => {
    const location = offset(center, s.north, s.east);
    const p = nearestPlace(location, places);
    return {
      id: s.id, user: toUser(s.userId), location, placeName: p?.name ?? "Nearby", placeId: p?.id,
      mediaUrl: photo(`story-${s.id}`, 720, 1280), mediaColor: s.color, caption: s.caption, hashtags: s.hashtags,
      badge: s.badge, group: s.group, createdAt: ago(s.hoursAgo),
    };
  });
}

function chits(center: LatLng, places: RawPlace[] = []): Chit[] {
  return CHIT_SEEDS.map((c) => {
    const location = offset(center, c.north, c.east);
    const p = nearestPlace(location, places);
    return {
      id: c.id, user: toUser(c.userId), location, placeName: p?.name ?? "Nearby", placeId: p?.id,
      mediaUrl: photo(`chit-${c.id}`, 720, 1280), mediaColor: c.color, isVideo: c.isVideo, caption: c.caption, sound: c.sound,
      hashtags: c.hashtags, likes: c.likes, comments: c.comments, views: c.views, reposts: c.reposts, shares: c.shares,
      liked: c.likes > 5000, createdAt: ago(c.hoursAgo),
    };
  });
}

function people(center: LatLng): Person[] {
  return PEOPLE_SEEDS.map((p) => ({ ...toUser(p.userId), location: offset(center, p.north, p.east), updatedAt: new Date(Date.now() - p.minutesAgo * 60_000).toISOString() }));
}

function hashtags(center: LatLng): Hashtag[] {
  return HASHTAG_SEEDS.map((h) => ({
    tag: h.tag, name: h.name, imageUrl: h.imageUrl || photo(`tag-${h.tag}`, 400, 400), color: h.color, description: h.description,
    locationName: h.locationName, address: h.address, location: offset(center, h.north, h.east), members: h.members,
    chitCount: h.chitCount, createdBy: toUser(h.createdBy), visibility: "Public", lastMessage: h.lastMessage,
    active: h.active, joined: false, trending: h.trending,
  }));
}

/** Add your community's data to map places: rating, photos, friends visited. */
export async function withCommunity(raw: RawPlace[], center: LatLng): Promise<Place[]> {
  if (API && raw.length) {
    const data = await api<Record<string, Pick<Place, "rating" | "reviews" | "photos" | "friendsVisited">>>("/places/community", {
      method: "POST", body: JSON.stringify({ ids: raw.map((p) => p.id) }),
    }).catch(() => ({}) as Record<string, never>);
    return raw.map((p) => {
      const d = data[p.id];
      return { ...p, photoColor: "#D9D4CC", rating: d?.rating, reviews: d?.reviews, photos: d?.photos ?? [], friendsVisited: d?.friendsVisited ?? [] };
    });
  }
  const cs = chits(center, raw);
  const friends = USERS.filter((u) => u.isFollowing);
  return raw.map((p) => {
    const h = hash(p.id);
    const here = cs.filter((c) => distanceKm(c.location, p.location) < 0.15);
    const reviewed = h % 5 !== 0; // most places have reviews
    const nFriends = h % 4; // 0–3 friends visited
    return {
      ...p,
      description: p.description ?? undefined,
      rating: reviewed ? Math.round((4 + (h % 10) / 10) * 10) / 10 : undefined,
      reviews: reviewed ? 8 + (h % 400) : undefined,
      photos: [...here.map((c) => c.mediaUrl!), ...[0, 1, 2, 3].map((i) => photo(`place-${p.id}-${i}`, 600, 600))].slice(0, 6),
      photoColor: ["#C9B8A6", "#8E7A6A", "#A67C5B", "#6E8A5E", "#7D8FA3"][h % 5],
      friendsVisited: Array.from({ length: nFriends }, (_, i) => toUser(friends[(h + i) % friends.length].id)),
    };
  });
}

// ---------- public API ----------

export async function getFeed(center: LatLng) {
  const { places, source } = await getNearbyPlaces(center);
  if (API) {
    const f = await api<{ stories: Story[]; chits: Chit[]; people: Person[]; hashtags: Hashtag[] }>(`/feed?${ll(center)}`);
    return { center, ...f, places: await withCommunity(places, center), placesSource: source };
  }
  return {
    center, stories: stories(center, places), chits: chits(center, places), people: people(center), hashtags: hashtags(center),
    places: await withCommunity(places, center), placesSource: source,
  };
}

export async function getStory(id: string, center: LatLng) {
  if (API) return api<Story & { next: string[] }>(`/stories/${encodeURIComponent(id)}`);
  const { places } = await getNearbyPlaces(center);
  const all = stories(center, places);
  const i = all.findIndex((s) => s.id === id);
  if (i < 0) return null;
  const s = all[i];
  const userStories = all.filter((x) => x.user.id === s.user.id);
  const storyIndex = userStories.findIndex((x) => x.id === id);
  return {
    ...s,
    next: userStories.slice(storyIndex + 1).map((x) => x.id),
    storyIndex,
    storyCount: userStories.length,
  };
}

export async function getChit(id: string, center: LatLng) {
  if (API) return api<Chit & { next: string[]; more: Chit[] }>(`/chits/${encodeURIComponent(id)}`);
  const { places } = await getNearbyPlaces(center);
  const all = chits(center, places);
  const c = all.find((x) => x.id === id);
  if (!c) return null;
  const more = all.filter((x) => x.id !== id).sort((a, b) => distanceKm(c.location, a.location) - distanceKm(c.location, b.location)).slice(0, 8);
  return { ...c, next: more.map((x) => x.id), more };
}

export async function getHashtag(tag: string, center: LatLng) {
  const t = tag.toLowerCase().replace(/^#/, "");
  if (API) return api<{ hashtag: Hashtag; chits: Chit[]; stories: Story[] }>(`/hashtags/${encodeURIComponent(t)}?${ll(center)}`);
  const h = hashtags(center).find((x) => x.tag === t);
  if (!h) return null;
  const { places } = await getNearbyPlaces(center);
  return {
    hashtag: h,
    chits: chits(center, places).filter((c) => c.hashtags.includes(t) || distanceKm(c.location, h.location) < 0.2),
    stories: stories(center, places).filter((s) => s.hashtags.includes(t) || distanceKm(s.location, h.location) < 0.2),
  };
}

export async function getUser(username: string, center: LatLng) {
  if (API) return api<{ user: User; chits: Chit[] }>(`/users/${encodeURIComponent(username)}`);
  const s = USERS.find((u) => u.username === username);
  if (!s) return null;
  return { user: toUser(s.id), chits: chits(center).filter((c) => c.user.id === s.id), stories: stories(center).filter((x) => x.user.id === s.id) };
}

export async function getPlaceDetail(id: string, center: LatLng) {
  const raw = await getPlace(id, center);
  if (!raw) return null;
  const [place] = await withCommunity([raw], center);
  const { places } = await getNearbyPlaces(center);
  const near = (x: { location: LatLng }) => distanceKm(x.location, place.location) < 0.2;
  const cs = API ? [] : chits(center, places).filter(near);
  const ss = API ? [] : stories(center, places).filter(near);
  const hs = API ? [] : hashtags(center).filter(near);
  return { place, chits: cs, stories: ss, hashtags: hs };
}

function matchesFilters(p: Place, f: Filters, center: LatLng) {
  if (f.category && p.category !== f.category) return false;
  if (distanceKm(center, p.location) > f.km) return false;
  if (f.minRating && (p.rating ?? 0) < f.minRating) return false;
  if (f.openNow && !hoursStatus(p.openingHours)?.open) return false;
  if (f.openLate && !isOpenLate(p.openingHours)) return false;
  return true;
}

/** Places for the results list/map, with filters applied. */
export async function findPlaces(q: string, f: Filters, center: LatLng) {
  const category = f.category ?? categoryFromQuery(q);
  const raw = category
    ? (await getNearbyPlaces(center, category, Math.max(f.km, 1))).places
    : q ? await searchPlaces(q, center) : (await getNearbyPlaces(center, undefined, f.km)).places;
  const places = (await withCommunity(raw, center)).filter((p) => matchesFilters(p, { ...f, category }, center));
  places.sort((a, b) =>
    (f.friends ? b.friendsVisited.length - a.friendsVisited.length : 0) ||
    distanceKm(center, a.location) - distanceKm(center, b.location));
  return { places, category };
}

export async function search(q: string, f: Filters, center: LatLng) {
  const raw = q.trim().toLowerCase();
  const onlyTags = raw.startsWith("#");
  const onlyPeople = raw.startsWith("@");
  const s = raw.replace(/^[#@]/, "");
  const locatedQuery = !onlyTags && !onlyPeople ? q.trim().match(/^(.+?)\s+(?:in|near|at)\s+(.+)$/i) : null;
  const located = locatedQuery ? await geocodeLocation(locatedQuery[2].trim()) : null;
  const searchCenter = located?.center ?? center;
  const placeQuery = located ? locatedQuery![1].trim() : q;
  const { places, category } = onlyTags || onlyPeople ? { places: [] as Place[], category: undefined } : await findPlaces(placeQuery, f, searchCenter);
  const categories: { category: PlaceCategory; count: number }[] = category ? [{ category, count: places.length }] : [];

  if (API) {
    const app = await api<{ people: User[]; hashtags: Hashtag[]; chits: Chit[] }>(`/search?q=${encodeURIComponent(q)}&${ll(center)}`);
    return { categories, places, ...app, searchCenter, searchLocation: located?.label };
  }
  const words = s.split(/\s+/).filter(Boolean);
  const hit = (text: string) => words.every((w) => text.toLowerCase().includes(w)) || (category && /coffee|caf/.test(text.toLowerCase()) && category === "coffee");
  return {
    categories,
    places,
    people: onlyTags
      ? []
      : allUsers()
          .filter((u) => hit(`${u.username} ${u.name}`))
          .map((u) => {
            const seed = PEOPLE_SEEDS.find((p) => p.userId === u.id);
            const location = seed
              ? offset(center, seed.north, seed.east)
              : offset(center, ((hash(u.id + "n") % 600) - 300), ((hash(u.id + "e") % 600) - 300));
            return { ...u, location, updatedAt: new Date().toISOString() };
          }),
    hashtags: onlyPeople ? [] : hashtags(center).filter((h) => hit(`${h.tag} ${h.name} ${h.description}`)),
    chits: onlyPeople ? [] : chits(center).filter((c) => hit(`${c.caption} ${c.hashtags.join(" ")}`)),
    searchCenter,
    searchLocation: located?.label,
  };
}

export async function report(_: { type: "story" | "chit" | "user"; id: string; reason: string }) {
  if (API) return api<{ ok: boolean }>("/reports", { method: "POST", body: JSON.stringify(_) });
  return { ok: true };
}
