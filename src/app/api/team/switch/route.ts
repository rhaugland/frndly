import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const teamId = body.teamId?.trim();
  if (!teamId) {
    return NextResponse.json({ error: "Team ID required" }, { status: 400 });
  }

  // Verify user is the creator or a member of this team
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  // Allow if user created this team OR is currently a member
  const isCreator = team.createdById === session.user.id;
  const currentMember = await prisma.user.findFirst({ where: { id: session.user.id, teamId } });

  if (!isCreator && !currentMember) {
    return NextResponse.json({ error: "Not a member of this team" }, { status: 403 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { teamId, role: team.createdById === session.user.id ? "admin" : "member" },
  });

  return NextResponse.json({ teamId }, { status: 200 });
}
