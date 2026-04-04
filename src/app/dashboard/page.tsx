import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TopBar } from "@/components/top-bar";
import { DashboardGrid } from "@/components/dashboard-grid";
import { SuggestionPanel } from "@/components/suggestion-panel";
import { generateSuggestions } from "@/lib/suggestions/engine";
import { UserSchedule } from "@/lib/suggestions/types";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { team: true },
  });

  if (!user?.team) redirect("/");

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

  const myWeather = teammates
    .find((t) => t.id === user.id)
    ?.weatherScores[0]?.weatherCondition as
    | "sunny"
    | "partly_cloudy"
    | "cloudy"
    | "rain"
    | "thunderstorm"
    | undefined;

  const otherTeammates = teammates.filter((t) => t.id !== user.id);

  const teammateData = otherTeammates.map((t) => {
    const score = t.weatherScores[0];
    return {
      id: t.id,
      name: t.name,
      avatarUrl: t.avatarUrl,
      weatherCondition: (score?.weatherCondition || "sunny") as
        | "sunny"
        | "partly_cloudy"
        | "cloudy"
        | "rain"
        | "thunderstorm",
      meetingsCount: score?.meetingsCount || 0,
      percentBlocked: Number(score?.percentBlocked || 0),
      nextAvailable: null as string | null,
    };
  });

  const schedules: UserSchedule[] = otherTeammates.map((t) => ({
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

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        teamName={user.team.name}
        userName={user.name}
        userWeather={myWeather}
      />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Today&apos;s forecast
            </h2>
            <DashboardGrid teammates={teammateData} teamId={user.teamId!} />
          </div>
          <div className="w-full lg:w-80 shrink-0">
            <SuggestionPanel suggestions={suggestions} />
          </div>
        </div>
      </main>
    </div>
  );
}
