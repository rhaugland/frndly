import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateSuggestions } from "@/lib/suggestions/engine";
import { UserSchedule } from "@/lib/suggestions/types";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user?.teamId) {
    return NextResponse.json({ suggestions: [] });
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(today.getUTCDate() + 1);

  const teammates = await prisma.user.findMany({
    where: { teamId: user.teamId, id: { not: user.id } },
    include: {
      syncedEvents: {
        where: { startTime: { gte: today }, endTime: { lte: tomorrow } },
      },
      weatherScores: {
        where: { date: today },
      },
    },
  });

  const schedules: UserSchedule[] = teammates.map((t) => ({
    userId: t.id,
    userName: t.name,
    events: t.syncedEvents.map((e) => ({
      startTime: e.startTime,
      endTime: e.endTime,
    })),
    workingHoursStart: t.workingHoursStart,
    workingHoursEnd: t.workingHoursEnd,
    timezone: t.timezone,
    weatherCondition: t.weatherScores[0]?.weatherCondition || "sunny",
  }));

  const suggestions = generateSuggestions(schedules, today);

  return NextResponse.json({ suggestions });
}
