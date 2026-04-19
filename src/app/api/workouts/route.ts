import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { detectAndCreatePRs } from "@/lib/pr";
import type { Category } from "@/lib/ppl";

const VALID_CATEGORIES: Category[] = ["PUSH", "PULL", "LEGS", "OTHER"];

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const workouts = await prisma.workout.findMany({
    where: { userId: session.user.id },
    orderBy: { performedAt: "desc" },
    include: {
      exercises: { include: { sets: true }, orderBy: { order: "asc" } },
      prs: true,
      _count: { select: { likes: true, comments: true } }
    },
    take: 50
  });
  return NextResponse.json(workouts);
}

type IncomingSet = { reps: number; weight: number; rpe?: number };
type IncomingExercise = { name: string; sets: IncomingSet[] };
type IncomingBody = {
  title?: string;
  category?: Category;
  notes?: string;
  performedAt?: string;
  exercises?: IncomingExercise[];
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json()) as IncomingBody;
  const title = (body.title ?? "").trim() || "Workout";
  const category: Category = VALID_CATEGORIES.includes(body.category as Category)
    ? (body.category as Category)
    : "OTHER";
  const performedAt = body.performedAt ? new Date(body.performedAt) : new Date();

  const exercises = (body.exercises ?? [])
    .map((ex) => ({
      name: (ex.name ?? "").trim(),
      sets: (ex.sets ?? [])
        .map((s) => ({
          reps: Number.isFinite(s.reps) ? Math.max(0, Math.floor(s.reps)) : 0,
          weight: Number.isFinite(s.weight) ? Math.max(0, s.weight) : 0,
          rpe: typeof s.rpe === "number" && Number.isFinite(s.rpe) ? s.rpe : undefined
        }))
        .filter((s) => s.reps > 0)
    }))
    .filter((ex) => ex.name.length > 0 && ex.sets.length > 0);

  if (exercises.length === 0) {
    return NextResponse.json({ error: "at least one exercise with sets is required" }, { status: 400 });
  }

  const workout = await prisma.workout.create({
    data: {
      userId: session.user.id,
      title,
      category,
      notes: body.notes?.trim() || null,
      performedAt,
      exercises: {
        create: exercises.map((ex, i) => ({
          name: ex.name,
          order: i,
          sets: {
            create: ex.sets.map((s, j) => ({
              reps: s.reps,
              weight: s.weight,
              rpe: s.rpe,
              order: j
            }))
          }
        }))
      }
    }
  });

  const prs = await detectAndCreatePRs({
    userId: session.user.id,
    workoutId: workout.id,
    performedAt,
    exercises
  });

  return NextResponse.json({ id: workout.id, prs });
}
