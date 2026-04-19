import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export const metadata = { title: "#IronChallenge — IronFeed" };

export default async function ChallengesPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const now = new Date();
  const [active, upcoming, past] = await Promise.all([
    prisma.challenge.findMany({
      where: { startsAt: { lte: now }, endsAt: { gte: now } },
      orderBy: { endsAt: "asc" }
    }),
    prisma.challenge.findMany({
      where: { startsAt: { gt: now } },
      orderBy: { startsAt: "asc" },
      take: 5
    }),
    prisma.challenge.findMany({
      where: { endsAt: { lt: now } },
      orderBy: { endsAt: "desc" },
      take: 5
    })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">#IronChallenge</h1>
        <p className="text-xs opacity-60">
          Monthly public challenges. Join by logging workouts with the matching metric.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="font-semibold">Active</h2>
        {active.length === 0 && (
          <p className="card p-4 opacity-70 text-sm">No active challenge — check back soon.</p>
        )}
        {active.map((c) => (
          <div key={c.id} className="card p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">{c.title}</h3>
              <span className="chip-legs">
                ends {format(c.endsAt, "d MMM")}
              </span>
            </div>
            <p className="text-sm opacity-80 mt-1">{c.description}</p>
            <div className="text-xs opacity-60 mt-2">metric: {c.metric}</div>
          </div>
        ))}
      </section>

      {upcoming.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">Upcoming</h2>
          {upcoming.map((c) => (
            <div key={c.id} className="card p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{c.title}</span>
                <span className="text-xs opacity-60">
                  {format(c.startsAt, "d MMM")}
                </span>
              </div>
            </div>
          ))}
        </section>
      )}

      {past.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">Past</h2>
          {past.map((c) => (
            <div key={c.id} className="card p-3 opacity-70">
              <div className="flex items-center justify-between">
                <span className="font-medium">{c.title}</span>
                <span className="text-xs">{format(c.endsAt, "d MMM yy")}</span>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
