import { NextRequest, NextResponse } from "next/server";
import { report } from "@/lib/data/app-data";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.id || !body?.type || !body?.reason) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (!["story", "chit", "user"].includes(body.type)) return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  const reason = String(body.reason).trim().slice(0, 200);
  if (!reason) return NextResponse.json({ error: "Reason is required" }, { status: 400 });
  return NextResponse.json(await report({ type: body.type, id: String(body.id), reason }));
}
