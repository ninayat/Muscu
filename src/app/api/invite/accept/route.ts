import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { grantReferralBonus } from "@/lib/referral";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { code } = (await req.json()) as { code?: string };
  if (!code) return NextResponse.json({ error: "missing_code" }, { status: 400 });

  const referrer = await prisma.user.findUnique({
    where: { referralCode: code },
    select: { id: true }
  });
  if (!referrer) return NextResponse.json({ error: "invalid_code" }, { status: 404 });
  if (referrer.id === session.user.id)
    return NextResponse.json({ error: "self_referral" }, { status: 400 });

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { referredById: true }
  });
  if (me?.referredById)
    return NextResponse.json({ error: "already_referred" }, { status: 409 });

  await grantReferralBonus({
    referrerId: referrer.id,
    refereeId: session.user.id
  });
  return NextResponse.json({ ok: true });
}
