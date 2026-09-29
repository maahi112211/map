import { NextRequest, NextResponse } from "next/server";
import { distanceKm } from "@/lib/geo";
import type { LatLng } from "@/lib/types";

// Free routing, no key: FOSSGIS OSRM servers (car / bike / foot).
// Fallback: straight line with an average speed, so the screen never breaks.
const PROFILES = {
  driving: { host: "routed-car", kmh: 25 },
  cycling: { host: "routed-bike", kmh: 14 },
  walking: { host: "routed-foot", kmh: 4.8 },
} as const;
type Mode = keyof typeof PROFILES;

function validPoint(value: string | null): LatLng | null {
  if (!value) return null;
  const parts = value.split(",");
  if (parts.length !== 2) return null;
  const lat = Number(parts[0]);
  const lng = Number(parts[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const from = validPoint(sp.get("from"));
  const to = validPoint(sp.get("to"));
  if (!from || !to) {
    return NextResponse.json({ error: "Valid from and to coordinates are required" }, { status: 400 });
  }
  const results = await Promise.all(
    (Object.keys(PROFILES) as Mode[]).map(async (mode) => {
      const p = PROFILES[mode];
      const url = `https://routing.openstreetmap.de/${p.host}/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&alternatives=false`;
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": process.env.OSM_USER_AGENT || "OpenOneMap/0.1" },
          signal: AbortSignal.timeout(7000),
          next: { revalidate: 300 },
        });
        if (!res.ok) throw new Error(String(res.status));
        const json = await res.json();
        const r = json.routes?.[0];
        if (!r) throw new Error("no route");
        return {
          mode,
          distanceKm: r.distance / 1000,
          minutes: Math.max(1, Math.round(r.duration / 60)),
          line: (r.geometry.coordinates as [number, number][]).map(([lng, lat]) => [lat, lng]),
          estimated: false,
        };
      } catch {
        const km = distanceKm(from, to) * 1.3; // straight line → rough road distance
        return {
          mode,
          distanceKm: km,
          minutes: Math.max(1, Math.round((km / p.kmh) * 60)),
          line: [[from.lat, from.lng], [to.lat, to.lng]],
          estimated: true,
        };
      }
    }),
  );
  return NextResponse.json({ from, to, routes: results });
}
