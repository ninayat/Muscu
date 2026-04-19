import { prisma } from "@/lib/prisma";

export function referralUrl(code: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/i/${code}`;
}

/**
 * K-factor = (invites sent per user) * (acceptance rate).
 * For an MVP we approximate invites-sent as the count of referral signups whose
 * referredById corresponds to that user — conservative but monotonic.
 */
export async function computeKFactor() {
  const totalUsers = await prisma.user.count();
  const referred = await prisma.user.count({
    where: { referredById: { not: null } }
  });
  const acceptanceRate = totalUsers === 0 ? 0 : referred / totalUsers;
  const invitesPerUser = totalUsers === 0 ? 0 : referred / totalUsers;
  // simple, transparent proxy
  const k = invitesPerUser * acceptanceRate;
  return {
    totalUsers,
    referred,
    acceptanceRate,
    invitesPerUser,
    kFactor: Number(k.toFixed(3))
  };
}

export async function grantReferralBonus(params: {
  referrerId: string;
  refereeId: string;
}) {
  const plus30 = (d: Date | null) => {
    const base = d && d > new Date() ? d : new Date();
    return new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);
  };

  const [referrer, referee] = await Promise.all([
    prisma.user.findUnique({ where: { id: params.referrerId } }),
    prisma.user.findUnique({ where: { id: params.refereeId } })
  ]);

  if (!referrer || !referee) return;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: referrer.id },
      data: { premiumUntil: plus30(referrer.premiumUntil) }
    }),
    prisma.user.update({
      where: { id: referee.id },
      data: {
        premiumUntil: plus30(referee.premiumUntil),
        referredById: referrer.id
      }
    })
  ]);
}
