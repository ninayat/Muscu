import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfWeek } from "date-fns";
import { workoutVolume } from "@/lib/volume";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const followees = await prisma.follow.findMany({
    where: { followerId: session.user.id },
    select: { followeeId: true }
  });
  const ids = [...new Set([session.user.id, ...followees.map((f) => f.followeeId)])];

  const workouts = await prisma.workout.findMany({
    where: {
      userId: { in: ids },
      performedAt: { gte: weekStart }
    },
    include: {
      user: { select: { id: true, username: true, name: true, image: true } },
      exercises: { include: { sets: true } }
    }
  });

  const tally = new Map<string, { user: typeof workouts[number]["user"]; volume: number; sessions: number }>();
  for (const w of workouts) {
    const cur = tally.get(w.userId);
    const vol = workoutVolume(w.exercises);
    if (cur) {
      cur.volume += vol;
      cur.sessions += 1;
    } else {
      tally.set(w.userId, { user: w.user, volume: vol, sessions: 1 });
    }
  }

  const leaderboard = Array.from(tally.values())
    .sort((a, b) => b.volume - a.volume)
    .map((row, i) => ({
      rank: i + 1,
      userId: row.user.id,
      username: row.user.username,
      name: row.user.name,
      image: row.user.image,
      volume: Math.round(row.volume),
      sessions: row.sessions
    }));

  return NextResponse.json({ weekStart: weekStart.toISOString(), leaderboard });
}
