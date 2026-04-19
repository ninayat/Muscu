import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Avatar } from "@/components/ui/Avatar";
import { PPLBadge } from "@/components/workout/PPLBadge";
import { format } from "date-fns";
import { workoutVolume, formatKg } from "@/lib/volume";
import { FollowButton } from "./FollowButton";

export default async function ProfilePage({
  params
}: {
  params: { username: string };
}) {
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      _count: { select: { followers: true, following: true, workouts: true, prs: true } }
    }
  });
  if (!user) notFound();

  const isMe = session?.user?.id === user.id;
  const amFollowing = session?.user && !isMe
    ? Boolean(
        await prisma.follow.findUnique({
          where: {
            followerId_followeeId: {
              followerId: session.user.id,
              followeeId: user.id
            }
          }
        })
      )
    : false;

  const workouts = await prisma.workout.findMany({
    where: { userId: user.id },
    orderBy: { performedAt: "desc" },
    take: 20,
    include: {
      exercises: { include: { sets: true } },
      prs: true,
      _count: { select: { likes: true, comments: true } }
    }
  });

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex items-center gap-4">
          <Avatar src={user.image} name={user.name} size={64} />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{user.name ?? user.username}</h1>
            <div className="text-xs opacity-60">@{user.username}</div>
          </div>
          {!isMe && session?.user && (
            <FollowButton userId={user.id} initial={amFollowing} />
          )}
        </div>
        {user.bio && <p className="text-sm opacity-80 mt-3">{user.bio}</p>}
        <div className="grid grid-cols-4 gap-2 mt-4 text-center">
          {[
            ["Workouts", user._count.workouts],
            ["PRs", user._count.prs],
            ["Followers", user._count.followers],
            ["Following", user._count.following]
          ].map(([k, v]) => (
            <div key={String(k)}>
              <div className="font-bold">{v}</div>
              <div className="text-[11px] opacity-60">{k}</div>
            </div>
          ))}
        </div>
      </div>

      <ul className="space-y-3">
        {workouts.map((w) => (
          <li key={w.id}>
            <Link href={`/workouts/${w.id}`} className="card p-4 block">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <PPLBadge category={w.category} />
                    <span className="text-xs opacity-60">
                      {format(w.performedAt, "d MMM")}
                    </span>
                  </div>
                  <div className="font-semibold">{w.title}</div>
                  <div className="text-xs opacity-70">
                    {w.exercises.length} exercises · {formatKg(workoutVolume(w.exercises))}
                  </div>
                </div>
                {w.prs.length > 0 && <span>🏅 {w.prs.length}</span>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
