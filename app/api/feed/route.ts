import { NextRequest, NextResponse } from "next/server";
import { getFeed } from "@/lib/data/app-data";
import { parseLatLng } from "@/lib/geo";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  try {
    return NextResponse.json(await getFeed(parseLatLng(sp.get("lat"), sp.get("lng"))));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
