import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PPLBadge } from "@/components/workout/PPLBadge";
import { PRBadge } from "@/components/PRBadge";
import { workoutVolume, formatKg } from "@/lib/volume";
import { Avatar } from "@/components/ui/Avatar";
import { LikeButton } from "@/components/feed/LikeButton";
import { CommentBox } from "@/components/feed/CommentBox";
import { format } from "date-fns";

export default async function WorkoutDetailPage({
  params
}: {
  params: { id: string };
}) {
  const session = await auth();
  const workout = await prisma.workout.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, username: true, name: true, image: true } },
      exercises: { include: { sets: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } },
      prs: true,
      comments: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { username: true, name: true, image: true } } }
      },
      _count: { select: { likes: true, comments: true } }
    }
  });
  if (!workout) notFound();

  const liked = session?.user
    ? Boolean(
        await prisma.like.findUnique({
          where: {
            userId_workoutId: {
              userId: session.user.id,
              workoutId: workout.id
            }
          }
        })
      )
    : false;

  const shareUrl = `/api/og/workout/${workout.id}`;

  return (
    <div className="space-y-4">
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar src={workout.user.image} name={workout.user.name} />
          <div>
            <Link
              href={`/profile/${workout.user.username}`}
              className="font-semibold"
            >
              {workout.user.name ?? workout.user.username}
            </Link>
            <div className="text-xs opacity-60">
              {format(workout.performedAt, "EEEE d MMM yyyy · HH:mm")}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PPLBadge category={workout.category} />
          {workout.prs.length > 0 && <PRBadge count={workout.prs.length} />}
        </div>

        <h1 className="text-2xl font-bold">{workout.title}</h1>
        {workout.notes && <p className="opacity-80 text-sm">{workout.notes}</p>}

        <div className="text-sm opacity-70">
          {workout.exercises.length} exercises ·{" "}
          {formatKg(workoutVolume(workout.exercises))}
        </div>

        <div className="flex items-center gap-3 pt-1 border-t border-black/5 dark:border-white/5 mt-2 pt-3">
          <LikeButton
            workoutId={workout.id}
            initialLiked={liked}
            initialCount={workout._count.likes}
          />
          <a href={shareUrl} target="_blank" className="btn-ghost text-sm" rel="noreferrer">
            📸 Share card
          </a>
        </div>
      </div>

      <div className="space-y-3">
        {workout.exercises.map((ex) => {
          const prHere = workout.prs.find((p) => p.exerciseName === ex.name);
          return (
            <div key={ex.id} className="card p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{ex.name}</h3>
                {prHere && <PRBadge />}
              </div>
              <table className="w-full mt-2 text-sm">
                <thead className="text-xs opacity-60">
                  <tr>
                    <th className="text-left font-normal py-1 pr-2">Set</th>
                    <th className="text-left font-normal py-1 pr-2">Weight</th>
                    <th className="text-left font-normal py-1 pr-2">Reps</th>
                    <th className="text-left font-normal py-1">RPE</th>
                  </tr>
                </thead>
                <tbody>
                  {ex.sets.map((s, i) => (
                    <tr key={s.id}>
                      <td className="py-1 pr-2">{i + 1}</td>
                      <td className="py-1 pr-2">{s.weight}kg</td>
                      <td className="py-1 pr-2">{s.reps}</td>
                      <td className="py-1">{s.rpe ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      <div className="card p-4">
        <h3 className="font-semibold mb-3">Comments</h3>
        {workout.comments.length === 0 && (
          <p className="text-sm opacity-60 mb-3">Be the first to comment.</p>
        )}
        <ul className="space-y-3 mb-3">
          {workout.comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <Avatar src={c.user.image} name={c.user.name} size={32} />
              <div>
                <div className="text-sm">
                  <span className="font-semibold">
                    {c.user.name ?? c.user.username}
                  </span>{" "}
                  <span className="opacity-60 text-xs">
                    · {format(c.createdAt, "d MMM")}
                  </span>
                </div>
                <div className="text-sm">{c.body}</div>
              </div>
            </li>
          ))}
        </ul>
        {session?.user ? (
          <CommentBox workoutId={workout.id} />
        ) : (
          <Link href="/signin" className="text-sm text-push underline">
            Sign in to comment
          </Link>
        )}
      </div>
    </div>
  );
}
