import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { coachChat } from "@/lib/anthropic";
import { subDays } from "date-fns";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { message, mode } = (await req.json()) as {
    message?: string;
    mode?: "chat" | "program";
  };

  if (!message || !message.trim()) {
    return NextResponse.json({ error: "missing_message" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        text: "🧠 IronCoach is offline — set `ANTHROPIC_API_KEY` in your `.env` to enable AI programme tweaks. (Get a key at https://console.anthropic.com/.)"
      },
      { status: 200 }
    );
  }

  const workouts = await prisma.workout.findMany({
    where: {
      userId: session.user.id,
      performedAt: { gte: subDays(new Date(), 14) }
    },
    orderBy: { performedAt: "asc" },
    include: { exercises: { include: { sets: true } } }
  });

  const compact = workouts.map((w) => ({
    date: w.performedAt.toISOString().slice(0, 10),
    category: w.category,
    title: w.title,
    exercises: w.exercises.map((ex) => ({
      name: ex.name,
      sets: ex.sets.map((s) => ({ w: s.weight, r: s.reps, rpe: s.rpe ?? null }))
    }))
  }));

  try {
    const { text, usage } = await coachChat({
      userMessage: message,
      workoutHistoryJSON: JSON.stringify(compact, null, 2),
      jsonOnly: mode === "program"
    });
    return NextResponse.json({ text, usage });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "coach_failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
