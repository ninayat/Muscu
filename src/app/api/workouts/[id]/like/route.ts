import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const existing = await prisma.like.findUnique({
    where: {
      userId_workoutId: { userId: session.user.id, workoutId: params.id }
    }
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    const count = await prisma.like.count({ where: { workoutId: params.id } });
    return NextResponse.json({ liked: false, count });
  }

  await prisma.like.create({
    data: { userId: session.user.id, workoutId: params.id }
  });
  const count = await prisma.like.count({ where: { workoutId: params.id } });
  return NextResponse.json({ liked: true, count });
}
