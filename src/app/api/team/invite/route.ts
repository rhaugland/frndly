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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { team: true },
  });

  if (!user?.team || user.role !== "admin") {
    return NextResponse.json({ error: "Must be team admin" }, { status: 403 });
  }

  const newCode = generateInviteCode();
  await prisma.team.update({
    where: { id: user.team.id },
    data: { inviteCode: newCode },
  });

  return NextResponse.json({ inviteCode: newCode });
}
