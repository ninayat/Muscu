import Link from "next/link";
import { format, formatDistanceToNowStrict } from "date-fns";
import { Avatar } from "@/components/ui/Avatar";
import { PPLBadge } from "@/components/workout/PPLBadge";
import { PRBadge } from "@/components/PRBadge";
import { LikeButton } from "@/components/feed/LikeButton";
import { workoutVolume, formatKg } from "@/lib/volume";
import type { Category } from "@prisma/client";

type Props = {
  workout: {
    id: string;
    title: string;
    category: Category;
    notes: string | null;
    performedAt: Date;
    user: { username: string; name: string | null; image: string | null };
    exercises: { id: string; name: string; sets: { weight: number; reps: number }[] }[];
    prs: { id: string; exerciseName: string }[];
    _count: { likes: number; comments: number };
  };
  liked: boolean;
};

export function WorkoutCard({ workout, liked }: Props) {
  const topLifts = workout.exercises
    .map((ex) => {
      const best = ex.sets.reduce(
        (b, s) => (s.weight * (1 + s.reps / 30) > b.e1 ? { e1: s.weight * (1 + s.reps / 30), w: s.weight, r: s.reps } : b),
        { e1: 0, w: 0, r: 0 }
      );
      return { name: ex.name, weight: best.w, reps: best.r };
    })
    .filter((x) => x.weight > 0)
    .slice(0, 3);

  return (
    <article className="card p-4 space-y-3">
      <header className="flex items-center gap-3">
        <Avatar src={workout.user.image} name={workout.user.name} />
        <div className="flex-1 min-w-0">
          <Link
            href={`/profile/${workout.user.username}`}
            className="font-semibold truncate block"
          >
            {workout.user.name ?? workout.user.username}
          </Link>
          <div className="text-xs opacity-60">
            {formatDistanceToNowStrict(workout.performedAt, { addSuffix: true })}
            {" · "}
            {format(workout.performedAt, "d MMM")}
          </div>
        </div>
        <PPLBadge category={workout.category} />
      </header>

      <Link href={`/workouts/${workout.id}`} className="block space-y-2">
        <h3 className="font-bold text-lg">{workout.title}</h3>
        {workout.notes && (
          <p className="text-sm opacity-80 line-clamp-2">{workout.notes}</p>
        )}

        {topLifts.length > 0 && (
          <ul className="grid grid-cols-3 gap-2">
            {topLifts.map((l) => (
              <li
                key={l.name}
                className="rounded-xl bg-black/5 dark:bg-white/5 p-2 text-center"
              >
                <div className="text-[11px] opacity-60 truncate">{l.name}</div>
                <div className="font-bold">{l.weight}kg × {l.reps}</div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-2 text-sm opacity-80">
          <span>{workout.exercises.length} exercises</span>
          <span>·</span>
          <span>{formatKg(workoutVolume(workout.exercises))}</span>
          {workout.prs.length > 0 && <PRBadge count={workout.prs.length} />}
        </div>
      </Link>

      <footer className="flex items-center gap-2 pt-2 border-t border-black/5 dark:border-white/5">
        <LikeButton
          workoutId={workout.id}
          initialLiked={liked}
          initialCount={workout._count.likes}
        />
        <Link href={`/workouts/${workout.id}`} className="btn-ghost text-sm">
          💬 {workout._count.comments}
        </Link>
        <a
          href={`/api/og/workout/${workout.id}`}
          target="_blank"
          rel="noreferrer"
          className="btn-ghost text-sm ml-auto"
        >
          📸 Share
        </a>
      </footer>
    </article>
  );
}
