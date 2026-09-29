import type { Filters, PlaceCategory } from "./types";

export const DEFAULT_FILTERS: Filters = { km: 5, minRating: 0, openNow: false, openLate: false, friends: false };
const CATS: PlaceCategory[] = ["coffee", "restaurant", "park", "hotel", "bar", "museum", "fuel", "atm", "hospital", "parking", "shop", "other"];

export function parseFilters(sp: URLSearchParams): Filters {
  const cat = sp.get("cat") as PlaceCategory | null;
  const km = Number(sp.get("km"));
  const r = Number(sp.get("rating"));
  return {
    category: cat && CATS.includes(cat) ? cat : undefined,
    km: Number.isFinite(km) && km > 0 ? Math.min(km, 20) : DEFAULT_FILTERS.km,
    minRating: Number.isFinite(r) ? Math.min(Math.max(r, 0), 5) : 0,
    openNow: sp.get("open") === "1",
    openLate: sp.get("late") === "1",
    friends: sp.get("friends") === "1",
  };
}

export function filtersToParams(f: Filters, into = new URLSearchParams()) {
  (["cat", "km", "rating", "open", "late", "friends"] as const).forEach((k) => into.delete(k));
  if (f.category) into.set("cat", f.category);
  if (f.km !== DEFAULT_FILTERS.km) into.set("km", String(f.km));
  if (f.minRating) into.set("rating", String(f.minRating));
  if (f.openNow) into.set("open", "1");
  if (f.openLate) into.set("late", "1");
  if (f.friends) into.set("friends", "1");
  return into;
}

export function activeFilterCount(f: Filters) {
  return Number(!!f.category) + Number(f.km !== DEFAULT_FILTERS.km) + Number(!!f.minRating) + Number(f.openNow) + Number(f.openLate) + Number(f.friends);
}
