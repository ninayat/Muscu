import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (session.user.id === params.userId)
    return NextResponse.json({ error: "cannot_self_follow" }, { status: 400 });

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followeeId: {
        followerId: session.user.id,
        followeeId: params.userId
      }
    }
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ following: false });
  }

  await prisma.follow.create({
    data: { followerId: session.user.id, followeeId: params.userId }
  });
  return NextResponse.json({ following: true });
}
