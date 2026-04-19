import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { grantReferralBonus } from "@/lib/referral";

export const metadata = { title: "Join IronFeed" };

export default async function InviteLanding({
  params
}: {
  params: { code: string };
}) {
  const referrer = await prisma.user.findUnique({
    where: { referralCode: params.code },
    select: { id: true, username: true, name: true, image: true }
  });

  const session = await auth();

  // If the user is already signed in and hasn't been referred yet, bind and grant.
  if (session?.user && referrer && session.user.id !== referrer.id) {
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referredById: true }
    });
    if (!me?.referredById) {
      await grantReferralBonus({
        referrerId: referrer.id,
        refereeId: session.user.id
      });
    }
    redirect("/feed");
  }

  // The cookie is set by src/middleware.ts so anonymous visitors keep the
  // referral code through sign-in.
  if (!referrer) redirect("/signin");

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="card p-6 max-w-sm w-full text-center space-y-3">
        <div className="text-3xl">🎁</div>
        <h1 className="text-2xl font-bold">
          {referrer.name ?? referrer.username} invited you
        </h1>
        <p className="opacity-80 text-sm">
          Sign up with this link and you both get a free month of IronFeed Premium.
        </p>
        <a href="/signin" className="btn-primary w-full">
          Create account
        </a>
      </div>
    </main>
  );
}
