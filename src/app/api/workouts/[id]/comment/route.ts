import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { body } = (await req.json()) as { body?: string };
  const trimmed = (body ?? "").trim();
  if (!trimmed) return NextResponse.json({ error: "empty" }, { status: 400 });
  if (trimmed.length > 500) return NextResponse.json({ error: "too_long" }, { status: 400 });

  const comment = await prisma.comment.create({
    data: {
      userId: session.user.id,
      workoutId: params.id,
      body: trimmed
    },
    include: {
      user: { select: { username: true, name: true, image: true } }
    }
  });
  return NextResponse.json(comment);
}
