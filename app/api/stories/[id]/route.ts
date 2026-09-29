import { NextRequest, NextResponse } from "next/server";
import { getStory } from "@/lib/data/app-data";
import { parseLatLng } from "@/lib/geo";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const sp = req.nextUrl.searchParams;
  const data = await getStory(decodeURIComponent(id), parseLatLng(sp.get("lat"), sp.get("lng")));
  if (!data) return NextResponse.json({ error: "Story not found" }, { status: 404 });
  return NextResponse.json(data);
}
