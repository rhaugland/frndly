import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isValidInviteCode } from "@/lib/team/invite";
import { AuthButton } from "@/components/auth-button";
import { WeatherIcon } from "@/components/weather-icon";

interface PageProps {
  params: Promise<{ inviteCode: string }>;
}

export default async function JoinPage({ params }: PageProps) {
  const { inviteCode } = await params;

  if (!isValidInviteCode(inviteCode)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-violet-50">
        <p className="text-slate-500">Invalid invite link.</p>
      </div>
    );
  }

  const team = await prisma.team.findUnique({
    where: { inviteCode },
  });

  if (!team) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-violet-50">
        <p className="text-slate-500">This invite link has expired or been revoked.</p>
      </div>
    );
  }

  const session = await getServerSession(authOptions);

  // If logged in, join the team and redirect to dashboard
  if (session?.user?.id) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { teamId: team.id, role: "member" },
    });
    redirect("/dashboard");
  }

  // Not logged in — show sign-in page with callbackUrl back to this join page
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-violet-50">
      <div className="w-full max-w-sm rounded-2xl bg-white/50 backdrop-blur-sm p-8 shadow-md border border-sky-100">
        <div className="mb-4 flex justify-center gap-2">
          <WeatherIcon condition="sunny" size={20} />
          <WeatherIcon condition="partly_cloudy" size={20} />
          <WeatherIcon condition="thunderstorm" size={20} />
        </div>
        <h1 className="mb-1 text-center text-2xl font-bold text-slate-800">
          Join {team.name}
        </h1>
        <p className="mb-8 text-center text-sm text-sky-400">
          Sign in to join the team and see their forecast
        </p>
        <div className="space-y-3">
          <AuthButton provider="google" label="Sign in with Google" callbackUrl={`/join/${inviteCode}`} />
          <AuthButton provider="azure-ad" label="Sign in with Microsoft" callbackUrl={`/join/${inviteCode}`} />
        </div>
      </div>
    </div>
  );
}
