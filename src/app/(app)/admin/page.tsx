import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeKFactor } from "@/lib/referral";
import { subDays } from "date-fns";

export const metadata = { title: "Admin — IronFeed" };

function isAdmin(email: string | null | undefined) {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  if (!isAdmin(session.user.email)) {
    return (
      <div className="card p-6 text-sm opacity-70">
        You don't have access. Add your email to{" "}
        <code>ADMIN_EMAILS</code> in <code>.env</code>.
      </div>
    );
  }

  const [k, totalWorkouts, recentSignups, topReferrers] = await Promise.all([
    computeKFactor(),
    prisma.workout.count(),
    prisma.user.count({ where: { createdAt: { gte: subDays(new Date(), 7) } } }),
    prisma.user.findMany({
      where: {
        referrals: { some: {} }
      },
      select: {
        username: true,
        name: true,
        _count: { select: { referrals: true } }
      },
      orderBy: { referrals: { _count: "desc" } },
      take: 10
    })
  ]);

  const stats: Array<[string, string | number]> = [
    ["K-factor", k.kFactor],
    ["Total users", k.totalUsers],
    ["Referred users", k.referred],
    ["Acceptance rate", `${(k.acceptanceRate * 100).toFixed(1)}%`],
    ["Invites / user", k.invitesPerUser.toFixed(2)],
    ["Workouts logged", totalWorkouts],
    ["Signups (7d)", recentSignups]
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admin</h1>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(([label, value]) => (
          <div key={label} className="card p-4">
            <div className="text-xs opacity-60">{label}</div>
            <div className="text-2xl font-bold">{value}</div>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <h2 className="font-semibold mb-3">Top referrers</h2>
        {topReferrers.length === 0 ? (
          <p className="text-sm opacity-60">No referrals yet.</p>
        ) : (
          <ol className="space-y-2">
            {topReferrers.map((u) => (
              <li
                key={u.username}
                className="flex items-center justify-between text-sm"
              >
                <span>{u.name ?? u.username}</span>
                <span className="font-bold">{u._count.referrals}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
