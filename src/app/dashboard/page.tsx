import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TopBar } from "@/components/top-bar";
import { DashboardTabs } from "@/components/dashboard-tabs";
import { generateSuggestions } from "@/lib/suggestions/engine";
import { UserSchedule } from "@/lib/suggestions/types";
import { OnboardingScreen } from "@/components/onboarding-screen";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEATHER_TYPES = ["sunny", "partly_cloudy", "cloudy", "rain", "thunderstorm"] as const;

function getDemoWeek(condition: typeof WEATHER_TYPES[number]) {
  const today = new Date();
  const baseIndex = WEATHER_TYPES.indexOf(condition);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i + 1); // Mon-Sun
    const jitter = Math.abs(((baseIndex * 7 + i * 3) % 5));
    const weatherCondition = WEATHER_TYPES[jitter];
    const meetingsCount = jitter * 2 + 1;
    const percentBlocked = jitter * 18 + 5;
    return {
      date: `${DAYS[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`,
      weatherCondition,
      meetingsCount,
      percentBlocked,
      isBestDay: jitter === 0,
    };
  });
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { team: true, createdTeams: { include: { _count: { select: { members: true } } } } },
  });

  if (!user?.team) {
    return <OnboardingScreen userName={user?.name || session.user.name || "there"} />;
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(today.getUTCDate() + 1);

  const teammates = await prisma.user.findMany({
    where: { teamId: user.teamId! },
    include: {
      weatherScores: { where: { date: today } },
      syncedEvents: {
        where: { startTime: { gte: today }, endTime: { lte: tomorrow } },
        orderBy: { startTime: "asc" },
      },
    },
  });

  type Teammate = typeof teammates[number];

  const myWeather = teammates
    .find((t: Teammate) => t.id === user.id)
    ?.weatherScores[0]?.weatherCondition as
    | "sunny"
    | "partly_cloudy"
    | "cloudy"
    | "rain"
    | "thunderstorm"
    | undefined;

  const otherTeammates = teammates.filter((t: Teammate) => t.id !== user.id);

  const teammateData = otherTeammates.map((t: Teammate) => {
    const score = t.weatherScores[0];
    const wc = (score?.weatherCondition || "sunny") as typeof WEATHER_TYPES[number];

    // Compute gaps between meetings (non-meeting times)
    const meetings = t.syncedEvents.map((e: Teammate["syncedEvents"][number]) => ({
      start: e.startTime.getUTCHours() * 60 + e.startTime.getUTCMinutes(),
      end: e.endTime.getUTCHours() * 60 + e.endTime.getUTCMinutes(),
    })).sort((a, b) => a.start - b.start);

    const openSlots: { start: string; end: string; duration: number }[] = [];
    // Find gaps between consecutive meetings
    for (let i = 0; i < meetings.length - 1; i++) {
      const gapStart = meetings[i].end;
      const gapEnd = meetings[i + 1].start;
      const durMin = gapEnd - gapStart;
      if (durMin >= 15) {
        openSlots.push({
          start: `${Math.floor(gapStart / 60)}:${String(gapStart % 60).padStart(2, "0")}`,
          end: `${Math.floor(gapEnd / 60)}:${String(gapEnd % 60).padStart(2, "0")}`,
          duration: durMin,
        });
      }
    }
    // Time before first meeting
    if (meetings.length > 0) {
      const firstStart = meetings[0].start;
      const workStartMin = parseInt(t.workingHoursStart.split(":")[0]) * 60 + parseInt(t.workingHoursStart.split(":")[1]);
      if (firstStart - workStartMin >= 15) {
        openSlots.unshift({
          start: t.workingHoursStart,
          end: `${Math.floor(firstStart / 60)}:${String(firstStart % 60).padStart(2, "0")}`,
          duration: firstStart - workStartMin,
        });
      }
      // Time after last meeting
      const lastEnd = meetings[meetings.length - 1].end;
      const workEndMin = parseInt(t.workingHoursEnd.split(":")[0]) * 60 + parseInt(t.workingHoursEnd.split(":")[1]);
      if (workEndMin - lastEnd >= 15) {
        openSlots.push({
          start: `${Math.floor(lastEnd / 60)}:${String(lastEnd % 60).padStart(2, "0")}`,
          end: t.workingHoursEnd,
          duration: workEndMin - lastEnd,
        });
      }
    }

    return {
      id: t.id,
      name: t.name || "Unknown",
      avatarUrl: t.avatarUrl,
      weatherCondition: wc,
      meetingsCount: score?.meetingsCount || 0,
      percentBlocked: Number(score?.percentBlocked || 0),
      nextAvailable: null as string | null,
      weeklyForecast: getDemoWeek(wc),
      openSlots,
    };
  });

  const schedules: UserSchedule[] = otherTeammates.map((t: Teammate) => ({
    userId: t.id,
    userName: t.name || "Unknown",
    events: t.syncedEvents.map((e: Teammate["syncedEvents"][number]) => ({
      startTime: e.startTime,
      endTime: e.endTime,
    })),
    workingHoursStart: t.workingHoursStart,
    workingHoursEnd: t.workingHoursEnd,
    timezone: t.timezone,
    weatherCondition: t.weatherScores[0]?.weatherCondition || "sunny",
  }));

  const suggestions = generateSuggestions(schedules, today);

  const hasRealData = teammateData.length > 0;

  // Build workspaces list from teams the user created + current team
  const workspaceSet = new Map<string, { id: string; name: string; inviteCode: string; isActive: boolean; isOwner: boolean; memberCount: number }>();
  if (user.team) {
    workspaceSet.set(user.team.id, {
      id: user.team.id,
      name: user.team.name,
      inviteCode: user.team.inviteCode,
      isActive: true,
      isOwner: user.team.createdById === user.id,
      memberCount: teammates.length,
    });
  }
  for (const t of user.createdTeams) {
    if (!workspaceSet.has(t.id)) {
      workspaceSet.set(t.id, {
        id: t.id,
        name: t.name,
        inviteCode: t.inviteCode,
        isActive: false,
        isOwner: true,
        memberCount: t._count.members,
      });
    }
  }
  const workspaces = Array.from(workspaceSet.values());

  // Demo data when no real teammates exist yet
  const displayTeammates = hasRealData ? teammateData : [
    { id: "demo-1", name: "Sarah Chen", avatarUrl: null, weatherCondition: "sunny" as const, meetingsCount: 1, percentBlocked: 12, nextAvailable: null, weeklyForecast: getDemoWeek("sunny"), openSlots: [{ start: "9:00", end: "10:00", duration: 60 }, { start: "10:30", end: "17:00", duration: 390 }] },
    { id: "demo-2", name: "Marcus Johnson", avatarUrl: null, weatherCondition: "partly_cloudy" as const, meetingsCount: 3, percentBlocked: 38, nextAvailable: "2:00 PM", weeklyForecast: getDemoWeek("partly_cloudy"), openSlots: [{ start: "9:00", end: "10:00", duration: 60 }, { start: "14:00", end: "15:30", duration: 90 }, { start: "16:00", end: "17:00", duration: 60 }] },
    { id: "demo-3", name: "Priya Patel", avatarUrl: null, weatherCondition: "cloudy" as const, meetingsCount: 5, percentBlocked: 55, nextAvailable: "3:30 PM", weeklyForecast: getDemoWeek("cloudy"), openSlots: [{ start: "9:00", end: "9:30", duration: 30 }, { start: "12:00", end: "13:00", duration: 60 }, { start: "15:30", end: "16:00", duration: 30 }] },
    { id: "demo-4", name: "Alex Rivera", avatarUrl: null, weatherCondition: "rain" as const, meetingsCount: 7, percentBlocked: 72, nextAvailable: "4:00 PM", weeklyForecast: getDemoWeek("rain"), openSlots: [{ start: "12:00", end: "12:30", duration: 30 }, { start: "16:00", end: "17:00", duration: 60 }] },
    { id: "demo-5", name: "Jordan Lee", avatarUrl: null, weatherCondition: "thunderstorm" as const, meetingsCount: 9, percentBlocked: 88, nextAvailable: "Tomorrow", weeklyForecast: getDemoWeek("thunderstorm"), openSlots: [{ start: "12:00", end: "12:30", duration: 30 }] },
  ];

  const displaySuggestions = suggestions.length > 0 ? suggestions : [
    { userId: "demo-1", userName: "Sarah Chen", message: "Sarah is wide open this afternoon — great time to sync on the Q3 roadmap.", type: "best_time" as const },
    { userId: "demo-5", userName: "Jordan Lee", message: "Jordan is in back-to-back meetings until 4 PM. Avoid reaching out until then.", type: "avoid" as const },
    { userId: "demo-2", userName: "Marcus Johnson", message: "Marcus has a rare 30-min gap at 2 PM — grab it before it fills up.", type: "rare_opening" as const },
    { userId: "demo-4", userName: "Alex Rivera", message: "Alex tends to be free Friday mornings — consider scheduling recurring 1:1s then.", type: "pattern" as const },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-violet-50">
      <TopBar
        teamName={user.team.name}
        userName={user.name || ""}
        userWeather={myWeather}
        workspaces={workspaces.map((w) => ({ id: w.id, name: w.name, isActive: w.isActive }))}
      />
      <main className="relative z-0 mx-auto max-w-7xl px-4 py-8">
        <DashboardTabs
          teammates={displayTeammates}
          teamId={user.teamId!}
          teamName={user.team.name}
          inviteCode={user.team.inviteCode}
          suggestions={displaySuggestions}
          hasRealData={hasRealData}
          workspaces={workspaces}
        />
      </main>
    </div>
  );
}
