import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/data/app-data";
import { parseLatLng } from "@/lib/geo";

export async function GET(req: NextRequest, ctx: { params: Promise<{ username: string }> }) {
  const { username } = await ctx.params;
  const sp = req.nextUrl.searchParams;
  const data = await getUser(decodeURIComponent(username), parseLatLng(sp.get("lat"), sp.get("lng")));
  if (!data) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(data);
}
