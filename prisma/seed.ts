import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Find Ryan's real Google account
  let ryan = await prisma.user.findUnique({ where: { email: "ryanrhaugland@gmail.com" } });

  if (!ryan) {
    // Create a placeholder if Ryan hasn't signed in yet
    ryan = await prisma.user.create({
      data: {
        name: "Ryan Haugland",
        email: "ryanrhaugland@gmail.com",
        workingHoursStart: "09:00",
        workingHoursEnd: "17:00",
        timezone: "America/New_York",
      },
    });
    console.log("Created placeholder for ryanrhaugland@gmail.com");
  }

  // Create demo team owned by Ryan's real account
  const team = await prisma.team.upsert({
    where: { inviteCode: "FRNDLY-DEMO" },
    update: { createdById: ryan.id },
    create: {
      name: "Frndly Demo Team",
      inviteCode: "FRNDLY-DEMO",
      createdById: ryan.id,
    },
  });

  console.log(`Created team: ${team.name} (invite: ${team.inviteCode})`);

  // Create second workspace also owned by Ryan
  const team2 = await prisma.team.upsert({
    where: { inviteCode: "FRNDLY-ENG" },
    update: { createdById: ryan.id },
    create: {
      name: "Engineering",
      inviteCode: "FRNDLY-ENG",
      createdById: ryan.id,
    },
  });

  console.log(`Created team: ${team2.name} (invite: ${team2.inviteCode})`);

  // Dummy teammates
  const teammates = [
    { name: "Sarah Chen", email: "sarah@frndly.app", weather: "sunny", meetings: 1, pctBlocked: 12 },
    { name: "Marcus Johnson", email: "marcus@frndly.app", weather: "partly_cloudy", meetings: 3, pctBlocked: 38 },
    { name: "Priya Patel", email: "priya@frndly.app", weather: "cloudy", meetings: 5, pctBlocked: 55 },
    { name: "Alex Rivera", email: "alex@frndly.app", weather: "rain", meetings: 7, pctBlocked: 72 },
    { name: "Jordan Lee", email: "jordan@frndly.app", weather: "thunderstorm", meetings: 9, pctBlocked: 88 },
  ];

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (const t of teammates) {
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        name: t.name,
        email: t.email,
        teamId: team.id,
        workingHoursStart: "09:00",
        workingHoursEnd: "17:00",
        timezone: "America/New_York",
      },
    });

    // Weather score for today
    await prisma.weatherScore.upsert({
      where: { userId_date: { userId: user.id, date: today } },
      update: {},
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

    // Create dummy meetings based on weather
    const meetingSlots = generateMeetings(t.meetings);
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

    console.log(`  Created ${t.name} (${t.weather}, ${t.meetings} meetings)`);
  }

  // Add one teammate to the Engineering workspace
  const engUser = await prisma.user.upsert({
    where: { email: "taylor@frndly.app" },
    update: {},
    create: {
      name: "Taylor Kim",
      email: "taylor@frndly.app",
      teamId: team2.id,
      workingHoursStart: "10:00",
      workingHoursEnd: "18:00",
      timezone: "America/Los_Angeles",
    },
  });

  await prisma.weatherScore.upsert({
    where: { userId_date: { userId: engUser.id, date: today } },
    update: {},
    create: {
      userId: engUser.id,
      date: today,
      meetingsCount: 4,
      hoursBlocked: 3.5,
      percentBlocked: 44,
      backToBacks: 1,
      hasDeadline: false,
      weatherCondition: "partly_cloudy",
    },
  });

  console.log(`  Created Taylor Kim in Engineering workspace`);
  console.log("Seeding complete!");
}

function generateMeetings(count: number) {
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
  return allSlots.slice(0, count);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
