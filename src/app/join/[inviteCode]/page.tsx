import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isValidInviteCode } from "@/lib/team/invite";
import { syncUser } from "@/lib/calendar/sync";
import { AuthButton } from "@/components/auth-button";

interface PageProps {
  params: { inviteCode: string };
}

export default async function JoinPage({ params }: PageProps) {
  const { inviteCode } = params;

  if (!isValidInviteCode(inviteCode)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Invalid invite link.</p>
      </div>
    );
  }

  const team = await prisma.team.findUnique({
    where: { inviteCode },
  });

  if (!team) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">This invite link has expired or been revoked.</p>
      </div>
    );
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 to-sky-100">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Join {team.name}
          </h1>
          <p className="mb-8 text-sm text-gray-500">
            Sign in to join the team and connect your calendar
          </p>
          <div className="space-y-3">
            <AuthButton provider="google" label="Sign in with Google" />
            <AuthButton provider="azure-ad" label="Sign in with Microsoft" />
          </div>
        </div>
      </div>
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { teamId: team.id, role: "member" },
  });

  try {
    await syncUser(session.user.id);
  } catch (e) {
    console.error("Initial sync failed:", e);
  }

  redirect("/dashboard");
}
