import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { privacyLevel, workingHoursStart, workingHoursEnd } = body;

  const validPrivacy = ["free_busy", "titles", "full_details"];
  if (privacyLevel && !validPrivacy.includes(privacyLevel)) {
    return NextResponse.json({ error: "Invalid privacy level" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(privacyLevel && { privacyLevel }),
      ...(workingHoursStart && { workingHoursStart }),
      ...(workingHoursEnd && { workingHoursEnd }),
    },
  });

  return NextResponse.json({ ok: true });
}
