import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { referralUrl } from "@/lib/referral";
import { InviteActions } from "./InviteActions";

export const metadata = { title: "Invite friends — IronFeed" };

export default async function InvitePage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { referralCode: true, premiumUntil: true }
  });
  if (!me) redirect("/signin");

  const referred = await prisma.user.count({
    where: { referredById: session.user.id }
  });
  const url = referralUrl(me.referralCode);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Invite friends</h1>
      <div className="card p-4 space-y-3">
        <p className="text-sm opacity-80">
          Share your link. For every friend who signs up you both get{" "}
          <strong>+1 month of IronFeed Premium</strong>.
        </p>
        <div className="rounded-xl bg-black/5 dark:bg-white/5 px-3 py-2 font-mono text-xs break-all">
          {url}
        </div>
        <InviteActions url={url} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <div className="text-xs opacity-60">Friends invited</div>
          <div className="text-2xl font-bold">{referred}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs opacity-60">Premium until</div>
          <div className="text-2xl font-bold">
            {me.premiumUntil
              ? me.premiumUntil.toLocaleDateString()
              : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
