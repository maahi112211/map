import { NextRequest, NextResponse } from "next/server";
import { search } from "@/lib/data/app-data";
import { parseFilters } from "@/lib/filters";
import { parseLatLng } from "@/lib/geo";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") || "").trim().slice(0, 100);
  const f = parseFilters(sp);
  if (!q && !f.category) return NextResponse.json({ categories: [], places: [], people: [], hashtags: [], chits: [] });
  try {
    return NextResponse.json(await search(q, f, parseLatLng(sp.get("lat"), sp.get("lng"))));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
