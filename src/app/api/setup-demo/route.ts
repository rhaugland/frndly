import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// One-time endpoint to set up demo data for the logged-in user
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const results: string[] = [];

  // 1. Create or update demo team, owned by current user
  let team = await prisma.team.findFirst({ where: { inviteCode: "FRNDLY-DEMO" } });
  if (team) {
    await prisma.team.update({ where: { id: team.id }, data: { createdById: userId } });
    results.push("Updated demo team ownership");
  } else {
    team = await prisma.team.create({
      data: { name: "Frndly Demo Team", inviteCode: "FRNDLY-DEMO", createdById: userId },
    });
    results.push("Created demo team");
  }

  // 2. Remove old placeholder user if it exists
  const placeholder = await prisma.user.findUnique({ where: { email: "ryan@frndly.app" } });
  if (placeholder) {
    // Delete related records first, then the user
    await prisma.weatherScore.deleteMany({ where: { userId: placeholder.id } });
    await prisma.syncedEvent.deleteMany({ where: { userId: placeholder.id } });
    await prisma.session.deleteMany({ where: { userId: placeholder.id } });
    await prisma.account.deleteMany({ where: { userId: placeholder.id } });
    await prisma.calendarConnection.deleteMany({ where: { userId: placeholder.id } });
    await prisma.user.delete({ where: { id: placeholder.id } });
    results.push("Removed placeholder ryan@frndly.app");
  }

  // 3. Create dummy teammates in demo team
  const teammates = [
    { name: "Sarah Chen", email: "sarah@frndly.app", weather: "sunny", meetings: 1, pctBlocked: 12 },
    { name: "Marcus Johnson", email: "marcus@frndly.app", weather: "partly_cloudy", meetings: 3, pctBlocked: 38 },
    { name: "Priya Patel", email: "priya@frndly.app", weather: "cloudy", meetings: 5, pctBlocked: 55 },
    { name: "Alex Rivera", email: "alex@frndly.app", weather: "rain", meetings: 7, pctBlocked: 72 },
    { name: "Jordan Lee", email: "jordan@frndly.app", weather: "thunderstorm", meetings: 9, pctBlocked: 88 },
  ];

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const allSlots = [
    { startHour: 9, startMin: 0, endHour: 9, endMin: 30, title: "Standup" },
    { startHour: 10, startMin: 0, endHour: 10, endMin: 30, title: "Design Review" },
    { startHour: 11, startMin: 0, endHour: 11, endMin: 45, title: "Sprint Planning" },
    { startHour: 13, startMin: 0, endHour: 13, endMin: 30, title: "1:1 with Manager" },
    { startHour: 14, startMin: 0, endHour: 14, endMin: 30, title: "Team Sync" },
    { startHour: 14, startMin: 30, endHour: 15, endMin: 0, title: "Product Review" },
    { startHour: 15, startMin: 0, endHour: 15, endMin: 30, title: "Retro" },
    { startHour: 15, startMin: 30, endHour: 16, endMin: 0, title: "Architecture Chat" },
    { startHour: 16, startMin: 0, endHour: 16, endMin: 30, title: "Cross-team Sync" },
  ];

  for (const t of teammates) {
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: { teamId: team.id },
      create: {
        name: t.name,
        email: t.email,
        teamId: team.id,
        workingHoursStart: "09:00",
        workingHoursEnd: "17:00",
        timezone: "America/New_York",
      },
    });

    await prisma.weatherScore.upsert({
      where: { userId_date: { userId: user.id, date: today } },
      update: {
        meetingsCount: t.meetings,
        hoursBlocked: t.pctBlocked / 12.5,
        percentBlocked: t.pctBlocked,
        backToBacks: Math.max(0, t.meetings - 2),
        weatherCondition: t.weather as any,
      },
      create: {
        userId: user.id,
        date: today,
        meetingsCount: t.meetings,
        hoursBlocked: t.pctBlocked / 12.5,
        percentBlocked: t.pctBlocked,
        backToBacks: Math.max(0, t.meetings - 2),
        hasDeadline: false,
        weatherCondition: t.weather as any,
      },
    });

    const meetingSlots = allSlots.slice(0, t.meetings);
    for (const slot of meetingSlots) {
      const startTime = new Date(today);
      startTime.setUTCHours(slot.startHour, slot.startMin, 0, 0);
      const endTime = new Date(today);
      endTime.setUTCHours(slot.endHour, slot.endMin, 0, 0);

      await prisma.syncedEvent.upsert({
        where: {
          userId_sourceEventId: {
            userId: user.id,
            sourceEventId: `seed-${user.id}-${slot.startHour}-${slot.startMin}`,
          },
        },
        update: {},
        create: {
          userId: user.id,
          sourceEventId: `seed-${user.id}-${slot.startHour}-${slot.startMin}`,
          startTime,
          endTime,
          title: slot.title,
          isAllDay: false,
          isDeadline: false,
        },
      });
    }

    results.push(`Created ${t.name} (${t.weather})`);
  }

  results.push("Done! Refresh the page.");
  return NextResponse.json({ results });
}
