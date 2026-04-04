import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateInviteCode } from "@/lib/team/invite";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const name = body.name?.trim();
  if (!name || name.length > 100) {
    return NextResponse.json({ error: "Team name required (max 100 chars)" }, { status: 400 });
  }

  const team = await prisma.team.create({
    data: {
      name,
      inviteCode: generateInviteCode(),
      createdById: session.user.id,
    },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { teamId: team.id, role: "admin" },
  });

  return NextResponse.json(team, { status: 201 });
}
