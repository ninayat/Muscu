import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfWeek, format } from "date-fns";
import { Avatar } from "@/components/ui/Avatar";
import { workoutVolume, formatKg } from "@/lib/volume";

export const metadata = { title: "Leaderboard — IronFeed" };

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const follows = await prisma.follow.findMany({
    where: { followerId: session.user.id },
    select: { followeeId: true }
  });
  const ids = [...new Set([session.user.id, ...follows.map((f) => f.followeeId)])];

  const workouts = await prisma.workout.findMany({
    where: { userId: { in: ids }, performedAt: { gte: weekStart } },
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
  const rows = Array.from(tally.values()).sort((a, b) => b.volume - a.volume);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Weekly leaderboard</h1>
        <p className="text-xs opacity-60">
          Total volume since {format(weekStart, "EEE d MMM")}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="card p-6 text-center opacity-70">
          No activity from your circle this week yet.
        </div>
      ) : (
        <ol className="space-y-2">
          {rows.map((r, i) => {
            const rank = i + 1;
            const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}`;
            const isMe = r.user.id === session.user.id;
            return (
              <li key={r.user.id}>
                <div
                  className={`card p-3 flex items-center gap-3 ${isMe ? "ring-2 ring-push" : ""}`}
                >
                  <div className="w-10 text-center text-lg">{medal}</div>
                  <Avatar src={r.user.image} name={r.user.name} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">
                      {r.user.name ?? r.user.username}
                      {isMe && <span className="text-xs opacity-60"> (you)</span>}
                    </div>
                    <div className="text-xs opacity-60">
                      @{r.user.username} · {r.sessions} session
                      {r.sessions === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatKg(r.volume)}</div>
                    <div className="text-xs opacity-60">volume</div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
