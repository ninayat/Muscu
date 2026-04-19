import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay } from "date-fns";

// Wire this to Vercel Cron (daily). It identifies users who worked out
// yesterday but not today, so they're about to break their streak, and returns
// them as a list. Hook your push / email provider up where indicated.
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const today = startOfDay(new Date());
  const yesterday = startOfDay(subDays(today, 1));

  const atRisk = await prisma.user.findMany({
    where: {
      workouts: {
        some: { performedAt: { gte: yesterday, lt: today } },
        none: { performedAt: { gte: today } }
      }
    },
    select: { id: true, email: true, username: true }
  });

  // TODO: enqueue push notification / email here.
  return NextResponse.json({ count: atRisk.length, users: atRisk });
}
