import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const workout = await prisma.workout.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, username: true, name: true, image: true } },
      exercises: { include: { sets: true }, orderBy: { order: "asc" } },
      prs: true,
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { username: true, name: true, image: true } }
        }
      },
      _count: { select: { likes: true, comments: true } }
    }
  });
  if (!workout) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(workout);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const w = await prisma.workout.findUnique({ where: { id: params.id } });
  if (!w) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (w.userId !== session.user.id)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  await prisma.workout.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
