import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TopBar } from "@/components/top-bar";
import { WeeklyForecast } from "@/components/weekly-forecast";

interface PageProps {
  params: { id: string };
  searchParams: { user?: string };
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default async function WeekPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { team: true },
  });

  if (!currentUser?.team || currentUser.team.id !== params.id) {
    redirect("/dashboard");
  }

  const targetUserId = searchParams.user || session.user.id;
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUser || targetUser.teamId !== params.id) redirect("/dashboard");

  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - ((dayOfWeek + 6) % 7));
  monday.setUTCHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 7);

  const scores = await prisma.weatherScore.findMany({
    where: {
      userId: targetUserId,
      date: { gte: monday, lt: sunday },
    },
    orderBy: { date: "asc" },
  });

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setUTCDate(monday.getUTCDate() + i);
    const dateKey = date.toISOString().split("T")[0];

    const score = scores.find(
      (s: typeof scores[number]) => s.date.toISOString().split("T")[0] === dateKey
    );

    const condition = (score?.weatherCondition || "sunny") as
      | "sunny"
      | "partly_cloudy"
      | "cloudy"
      | "rain"
      | "thunderstorm";

    return {
      date: `${DAY_NAMES[date.getUTCDay()]} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCDate()}`,
      weatherCondition: condition,
      meetingsCount: score?.meetingsCount || 0,
      percentBlocked: Number(score?.percentBlocked || 0),
      isBestDay: condition === "sunny" || condition === "partly_cloudy",
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        teamName={currentUser.team.name}
        userName={currentUser.name || ""}
        workspaces={[{ id: currentUser.team.id, name: currentUser.team.name, isActive: true }]}
      />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <a
          href="/dashboard"
          className="mb-6 inline-block text-sm text-gray-400 hover:text-gray-600"
        >
          &larr; Back to dashboard
        </a>
        <WeeklyForecast userName={targetUser.name || "Unknown"} days={days} />
      </main>
    </div>
  );
}
