import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PPLBadge } from "@/components/workout/PPLBadge";
import { workoutVolume, formatKg } from "@/lib/volume";
import { format } from "date-fns";

export const metadata = { title: "My workouts — IronFeed" };

export default async function WorkoutsPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const workouts = await prisma.workout.findMany({
    where: { userId: session.user.id },
    orderBy: { performedAt: "desc" },
    include: {
      exercises: { include: { sets: true } },
      prs: true,
      _count: { select: { likes: true, comments: true } }
    },
    take: 50
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My workouts</h1>
        <Link href="/workouts/new" className="btn-primary">
          + Log
        </Link>
      </div>

      {workouts.length === 0 ? (
        <div className="card p-6 text-center space-y-2">
          <p className="opacity-70">No workouts yet. Log your first one.</p>
          <Link href="/workouts/new" className="btn-primary inline-flex">
            Start
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {workouts.map((w) => (
            <li key={w.id}>
              <Link href={`/workouts/${w.id}`} className="card p-4 block">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <PPLBadge category={w.category} />
                      <span className="text-xs opacity-60">
                        {format(w.performedAt, "EEE d MMM, HH:mm")}
                      </span>
                    </div>
                    <div className="font-semibold">{w.title}</div>
                    <div className="text-xs opacity-70">
                      {w.exercises.length} exercises ·{" "}
                      {formatKg(workoutVolume(w.exercises))}
                    </div>
                  </div>
                  <div className="text-right text-xs opacity-60">
                    {w.prs.length > 0 && <div>🏅 {w.prs.length}</div>}
                    <div>❤ {w._count.likes}</div>
                    <div>💬 {w._count.comments}</div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
