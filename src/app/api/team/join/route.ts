import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isValidInviteCode } from "@/lib/team/invite";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const code = body.inviteCode?.trim();

  if (!code || !isValidInviteCode(code)) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 400 });
  }

  const team = await prisma.team.findUnique({
    where: { inviteCode: code },
  });

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { teamId: team.id, role: "member" },
  });

  return NextResponse.json({ teamId: team.id }, { status: 200 });
}
