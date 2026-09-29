// Places provider — FREE, no API key.
//   Nearby + details: OpenStreetMap Overpass API.  Text search: Nominatim.
// Falls back to sample places if those are unreachable.
// Ratings, photos and "friends visited" are NOT from the map provider — they come
// from your app (see lib/data/app-data.ts → withCommunity).
// Switching to Google Places later = re-implement the 3 exported functions.

import { distanceKm, offset } from "../geo";
import type { LatLng, Place, PlaceCategory } from "../types";
import { MOCK_PLACE_SEEDS } from "./mock";

const OVERPASS = "https://overpass-api.de/api/interpreter";
const NOMINATIM = "https://nominatim.openstreetmap.org";
const UA = process.env.OSM_USER_AGENT || "OpenOneMap/0.1 (set OSM_USER_AGENT in .env.local)";
const TIMEOUT_MS = 3000;

export type RawPlace = Omit<Place, "rating" | "reviews" | "photos" | "photoColor" | "friendsVisited">;

type OsmEl = { type: "node" | "way" | "relation"; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };
const overpassPending = new Map<string, Promise<OsmEl[]>>();

// Category → Overpass selectors
const SELECTORS: Record<PlaceCategory, string[]> = {
  coffee: ['["amenity"="cafe"]'],
  restaurant: ['["amenity"~"^(restaurant|fast_food|food_court)$"]'],
  park: ['["leisure"~"^(park|garden)$"]'],
  hotel: ['["tourism"~"^(hotel|guest_house|hostel)$"]'],
  bar: ['["amenity"~"^(bar|pub|nightclub)$"]'],
  museum: ['["tourism"~"^(museum|gallery|attraction)$"]'],
  fuel: ['["amenity"="fuel"]'],
  atm: ['["amenity"~"^(atm|bank)$"]'],
  hospital: ['["amenity"~"^(hospital|clinic)$"]'],
  parking: ['["amenity"="parking"]'],
  shop: ['["shop"~"^(mall|supermarket|department_store)$"]'],
  other: [],
};
const DEFAULT_CATS: PlaceCategory[] = ["coffee", "restaurant", "park", "museum", "bar", "hotel", "hospital"];

export function categoryFromTags(t: Record<string, string> = {}): PlaceCategory {
  const a = t.amenity, tr = t.tourism, l = t.leisure;
  if (a === "cafe") return "coffee";
  if (a === "restaurant" || a === "fast_food" || a === "food_court") return "restaurant";
  if (a === "bar" || a === "pub" || a === "nightclub") return "bar";
  if (a === "fuel") return "fuel";
  if (a === "atm" || a === "bank") return "atm";
  if (a === "hospital" || a === "clinic") return "hospital";
  if (a === "parking") return "parking";
  if (l === "park" || l === "garden") return "park";
  if (tr === "hotel" || tr === "guest_house" || tr === "hostel") return "hotel";
  if (tr === "museum" || tr === "gallery" || tr === "attraction") return "museum";
  if (t.shop) return "shop";
  return "other";
}

function addressFromTags(t: Record<string, string> = {}) {
  const parts = [[t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" "), t["addr:suburb"] || t["addr:neighbourhood"], t["addr:city"]].filter(Boolean);
  return parts.length ? parts.join(", ") : undefined;
}

function fromOsm(el: OsmEl): RawPlace | null {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  const name = el.tags?.name || el.tags?.["name:en"];
  if (lat == null || lng == null || !name) return null;
  return {
    id: `osm-${el.type}-${el.id}`,
    name,
    category: categoryFromTags(el.tags),
    location: { lat, lng },
    address: addressFromTags(el.tags),
    openingHours: el.tags?.opening_hours,
    phone: el.tags?.phone || el.tags?.["contact:phone"],
    website: el.tags?.website || el.tags?.["contact:website"],
    description: el.tags?.description,
    source: "osm",
  };
}

async function overpass(query: string): Promise<OsmEl[]> {
  const active = overpassPending.get(query);
  if (active) return active;

  const request = (async () => {
    const res = await fetch(OVERPASS, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA },
      body: "data=" + encodeURIComponent(query),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`Overpass ${res.status}`);
    return ((await res.json()) as { elements: OsmEl[] }).elements || [];
  })().finally(() => overpassPending.delete(query));

  overpassPending.set(query, request);
  return request;
}

export function mockPlaces(center: LatLng, category?: PlaceCategory, radiusKm = 50): RawPlace[] {
  return MOCK_PLACE_SEEDS.filter((p) => !category || p.category === category)
    .map((p) => ({
      id: p.id, name: p.name, category: p.category, location: offset(center, p.north, p.east),
      address: p.address, openingHours: p.hours, phone: p.phone, website: p.website, description: p.description, source: "mock" as const,
    }))
    .filter((p) => distanceKm(center, p.location) <= radiusKm);
}

// Cache: Overpass is a shared free service — be gentle.
const cache = new Map<string, { at: number; value: { places: RawPlace[]; source: "osm" | "mock" } }>();
const TTL = 10 * 60_000;

export async function getNearbyPlaces(center: LatLng, category?: PlaceCategory, radiusKm = 1.5): Promise<{ places: RawPlace[]; source: "osm" | "mock" }> {
  const key = `${center.lat.toFixed(3)},${center.lng.toFixed(3)}|${category ?? "*"}|${radiusKm}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value;
  let value: { places: RawPlace[]; source: "osm" | "mock" } = { places: mockPlaces(center, category, radiusKm), source: "mock" };
  try {
    const r = Math.round(Math.min(radiusKm, 20) * 1000);
    const around = `(around:${r},${center.lat},${center.lng})`;
    const sels = (category ? [category] : DEFAULT_CATS).flatMap((c) => SELECTORS[c]);
    const q = `[out:json][timeout:4];(${sels.map((s) => `nwr${s}["name"]${around};`).join("")});out center 120;`;
    const places = (await overpass(q))
      .map(fromOsm)
      .filter((p): p is RawPlace => !!p)
      .sort((a, b) => distanceKm(center, a.location) - distanceKm(center, b.location))
      .slice(0, 80);
    if (places.length) value = { places, source: "osm" };
  } catch (e) {
    console.warn("[places] OSM nearby failed → sample places:", (e as Error).message);
  }
  cache.set(key, { at: Date.now(), value });
  if (cache.size > 500) cache.delete(cache.keys().next().value!);
  return value;
}

export async function searchPlaces(q: string, center: LatLng): Promise<RawPlace[]> {
  const fallback = () => {
    const s = q.toLowerCase().trim();
    const category = categoryFromQuery(s);
    return mockPlaces(center).filter((p) =>
      p.name.toLowerCase().includes(s) ||
      p.address?.toLowerCase().includes(s) ||
      (category ? p.category === category : p.category.includes(s.replace(/s$/, "")))
    );
  };
  try {
    const d = 0.15;
    const url = `${NOMINATIM}/search?format=jsonv2&limit=10&extratags=1&addressdetails=1&q=${encodeURIComponent(q)}` +
      `&viewbox=${center.lng - d},${center.lat + d},${center.lng + d},${center.lat - d}`;
    const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en" }, signal: AbortSignal.timeout(TIMEOUT_MS), next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Nominatim ${res.status}`);
    type N = { osm_type: string; osm_id: number; lat: string; lon: string; name: string; display_name: string; category: string; type: string; extratags?: Record<string, string> };
    const places = ((await res.json()) as N[]).map((r) => ({
      id: `osm-${r.osm_type}-${r.osm_id}`,
      name: r.name || r.display_name.split(",")[0],
      category: categoryFromTags({ ...(r.extratags || {}), [r.category]: r.type }),
      location: { lat: Number(r.lat), lng: Number(r.lon) },
      address: r.display_name.split(",").slice(1, 3).join(",").trim() || undefined,
      openingHours: r.extratags?.opening_hours,
      phone: r.extratags?.phone,
      website: r.extratags?.website,
      source: "osm" as const,
    }));
    return places.length ? places : fallback();
  } catch (e) {
    console.warn("[places] Nominatim failed → sample places:", (e as Error).message);
    return fallback();
  }
}

/** Resolve a city, neighbourhood or address so category searches can target it. */
export async function geocodeLocation(q: string): Promise<{ center: LatLng; label: string } | null> {
  try {
    const url = `${NOMINATIM}/search?format=jsonv2&limit=1&addressdetails=1&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en" }, signal: AbortSignal.timeout(TIMEOUT_MS), next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`Nominatim ${res.status}`);
    type N = { lat: string; lon: string; display_name: string; name?: string };
    const [match] = (await res.json()) as N[];
    if (!match) return null;
    return {
      center: { lat: Number(match.lat), lng: Number(match.lon) },
      label: match.name || match.display_name.split(",").slice(0, 2).join(",").trim(),
    };
  } catch (e) {
    console.warn("[places] Location lookup failed:", (e as Error).message);
    return null;
  }
}

export async function getPlace(id: string, center: LatLng): Promise<RawPlace | null> {
  if (id.startsWith("mock-")) return mockPlaces(center).find((p) => p.id === id) ?? null;
  const m = /^osm-(node|way|relation)-(\d+)$/.exec(id);
  if (!m) return null;
  try {
    const els = await overpass(`[out:json][timeout:8];${m[1]}(${m[2]});out center tags;`);
    return els[0] ? fromOsm(els[0]) : null;
  } catch {
    return null;
  }
}

/** Words people type → a category ("cafes" → coffee). */
export function categoryFromQuery(q: string): PlaceCategory | undefined {
  const s = q.toLowerCase().trim();
  const map: [RegExp, PlaceCategory][] = [
    [/^(caf|cof|espresso|chai)/, "coffee"],
    [/^(rest|food|eat|dinn|lunch|biryani|pizza)/, "restaurant"],
    [/^(park|gard)/, "park"],
    [/^(hot|stay|hostel)/, "hotel"],
    [/^(bar|pub|club|drink)/, "bar"],
    [/^(mus|gallery)/, "museum"],
    [/^(fuel|petrol|gas)/, "fuel"],
    [/^(atm|bank)/, "atm"],
    [/^(hospital|clinic)/, "hospital"],
    [/^(parking)/, "parking"],
    [/^(shop|mall|supermarket|store)/, "shop"],
  ];
  return map.find(([r]) => r.test(s))?.[1];
}
