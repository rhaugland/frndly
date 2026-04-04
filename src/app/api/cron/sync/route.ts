import { NextRequest, NextResponse } from "next/server";
import { syncAllUsers } from "@/lib/calendar/sync";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await syncAllUsers();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Cron sync failed:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
