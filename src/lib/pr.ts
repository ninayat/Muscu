import { prisma } from "@/lib/prisma";

export const epley1RM = (weight: number, reps: number) =>
  reps <= 0 ? 0 : weight * (1 + reps / 30);

export type PRCandidate = {
  exerciseName: string;
  weight: number;
  reps: number;
  estimated1RM: number;
};

export function bestSetByEstimated1RM(
  sets: { weight: number; reps: number }[]
): { weight: number; reps: number; estimated1RM: number } | null {
  if (!sets.length) return null;
  return sets
    .map((s) => ({ weight: s.weight, reps: s.reps, estimated1RM: epley1RM(s.weight, s.reps) }))
    .sort((a, b) => b.estimated1RM - a.estimated1RM)[0];
}

/**
 * Detect and persist PRs for a newly-saved workout.
 * Returns the PR rows created.
 */
export async function detectAndCreatePRs(params: {
  userId: string;
  workoutId: string;
  exercises: { name: string; sets: { weight: number; reps: number }[] }[];
  performedAt?: Date;
}) {
  const { userId, workoutId, exercises, performedAt } = params;
  const created = [] as Array<{
    exerciseName: string;
    weight: number;
    reps: number;
    estimated1RM: number;
  }>;

  for (const ex of exercises) {
    const best = bestSetByEstimated1RM(ex.sets);
    if (!best || best.estimated1RM <= 0) continue;

    const prior = await prisma.pR.findFirst({
      where: { userId, exerciseName: ex.name },
      orderBy: { estimated1RM: "desc" }
    });

    if (!prior || best.estimated1RM > prior.estimated1RM) {
      await prisma.pR.create({
        data: {
          userId,
          workoutId,
          exerciseName: ex.name,
          weight: best.weight,
          reps: best.reps,
          estimated1RM: best.estimated1RM,
          achievedAt: performedAt ?? new Date()
        }
      });
      created.push({ exerciseName: ex.name, ...best });
    }
  }

  return created;
}
