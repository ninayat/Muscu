import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { MaxWeightChart } from "@/components/progress/MaxWeightChart";
import { VolumeHeatmap } from "@/components/progress/VolumeHeatmap";
import { StreakCounter } from "@/components/progress/StreakCounter";
import { computeStreak } from "@/lib/streak";
import { workoutVolume } from "@/lib/volume";

export const metadata = { title: "Progress — IronFeed" };

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const workouts = await prisma.workout.findMany({
    where: { userId: session.user.id },
    orderBy: { performedAt: "asc" },
    include: { exercises: { include: { sets: true } } }
  });

  // Daily volumes
  const byDay = new Map<string, number>();
  for (const w of workouts) {
    const key = format(w.performedAt, "yyyy-MM-dd");
    byDay.set(key, (byDay.get(key) ?? 0) + workoutVolume(w.exercises));
  }
  const daily = Array.from(byDay.entries()).map(([date, volume]) => ({ date, volume }));

  // Top-set (max weight) progression per exercise
  const exerciseMap = new Map<string, { date: string; value: number }[]>();
  for (const w of workouts) {
    for (const ex of w.exercises) {
      const topWeight = ex.sets.reduce((m, s) => Math.max(m, s.weight), 0);
      if (topWeight === 0) continue;
      const key = ex.name;
      const list = exerciseMap.get(key) ?? [];
      list.push({ date: format(w.performedAt, "d MMM"), value: topWeight });
      exerciseMap.set(key, list);
    }
  }
  const series = Array.from(exerciseMap.entries())
    .map(([exercise, data]) => ({ exercise, data }))
    .filter((s) => s.data.length >= 2)
    .sort((a, b) => b.data.length - a.data.length);

  const streak = computeStreak(workouts.map((w) => w.performedAt));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Progress</h1>
      <StreakCounter days={streak} />
      <MaxWeightChart series={series} />
      <VolumeHeatmap daily={daily} />
    </div>
  );
}
