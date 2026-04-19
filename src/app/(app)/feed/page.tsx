import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkoutCard } from "@/components/feed/WorkoutCard";

export const metadata = { title: "Feed — IronFeed" };

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const follows = await prisma.follow.findMany({
    where: { followerId: session.user.id },
    select: { followeeId: true }
  });
  const followeeIds = follows.map((f) => f.followeeId);
  const visibleUserIds = [...new Set([session.user.id, ...followeeIds])];

  const [workouts, myLikes] = await Promise.all([
    prisma.workout.findMany({
      where: { userId: { in: visibleUserIds } },
      orderBy: { performedAt: "desc" },
      take: 40,
      include: {
        user: { select: { username: true, name: true, image: true } },
        exercises: { include: { sets: true }, orderBy: { order: "asc" } },
        prs: true,
        _count: { select: { likes: true, comments: true } }
      }
    }),
    prisma.like.findMany({
      where: { userId: session.user.id },
      select: { workoutId: true }
    })
  ]);

  const likedSet = new Set(myLikes.map((l) => l.workoutId));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Feed</h1>
        <Link href="/workouts/new" className="btn-primary">
          + Log
        </Link>
      </div>

      {workouts.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="opacity-70">
            Your feed is empty. Follow some lifters — or log your first workout.
          </p>
          <Link href="/workouts/new" className="btn-primary mt-3 inline-flex">
            Log a workout
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {workouts.map((w) => (
            <li key={w.id}>
              <WorkoutCard workout={w} liked={likedSet.has(w.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
