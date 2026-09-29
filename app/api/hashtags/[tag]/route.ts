import { NextRequest, NextResponse } from "next/server";
import { getHashtag } from "@/lib/data/app-data";
import { parseLatLng } from "@/lib/geo";

export async function GET(req: NextRequest, ctx: { params: Promise<{ tag: string }> }) {
  const { tag } = await ctx.params;
  const sp = req.nextUrl.searchParams;
  const data = await getHashtag(decodeURIComponent(tag), parseLatLng(sp.get("lat"), sp.get("lng")));
  if (!data) return NextResponse.json({ error: "Hashtag not found" }, { status: 404 });
  return NextResponse.json(data);
}
