export type WorkoutWithEverything = Awaited<
  ReturnType<
    typeof import("@/lib/prisma").prisma.workout.findUnique
  >
>;
