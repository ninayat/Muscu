import { PrismaClient } from "@prisma/client";
import { subDays } from "date-fns";

const prisma = new PrismaClient();

type Category = "PUSH" | "PULL" | "LEGS" | "OTHER";

type SetSpec = { reps: number; weight: number; rpe?: number };
type ExerciseSpec = { name: string; sets: SetSpec[] };
type SessionSpec = {
  title: string;
  category: Category;
  daysAgo: number;
  exercises: ExerciseSpec[];
  notes?: string;
};

const epley = (w: number, r: number) => w * (1 + r / 30);

const pushDay = (daysAgo: number, overload = 0): SessionSpec => ({
  title: "Push Day",
  category: "PUSH",
  daysAgo,
  exercises: [
    {
      name: "Bench Press",
      sets: [
        { reps: 8, weight: 80 + overload },
        { reps: 6, weight: 85 + overload },
        { reps: 5, weight: 90 + overload, rpe: 8.5 }
      ]
    },
    {
      name: "Overhead Press",
      sets: [
        { reps: 8, weight: 45 + overload },
        { reps: 8, weight: 50 + overload },
        { reps: 6, weight: 55 + overload }
      ]
    },
    {
      name: "Incline Dumbbell Press",
      sets: [
        { reps: 10, weight: 28 },
        { reps: 10, weight: 30 },
        { reps: 8, weight: 32 }
      ]
    },
    {
      name: "Triceps Pushdown",
      sets: [
        { reps: 12, weight: 35 },
        { reps: 12, weight: 40 },
        { reps: 10, weight: 45 }
      ]
    }
  ]
});

const pullDay = (daysAgo: number, overload = 0): SessionSpec => ({
  title: "Pull Day",
  category: "PULL",
  daysAgo,
  exercises: [
    {
      name: "Deadlift",
      sets: [
        { reps: 5, weight: 120 + overload },
        { reps: 3, weight: 140 + overload },
        { reps: 1, weight: 160 + overload, rpe: 9 }
      ]
    },
    {
      name: "Pull Up",
      sets: [
        { reps: 8, weight: 0 },
        { reps: 7, weight: 0 },
        { reps: 6, weight: 0 }
      ]
    },
    {
      name: "Barbell Row",
      sets: [
        { reps: 8, weight: 70 + overload },
        { reps: 8, weight: 75 + overload },
        { reps: 6, weight: 80 + overload }
      ]
    },
    {
      name: "Barbell Curl",
      sets: [
        { reps: 10, weight: 30 },
        { reps: 10, weight: 32 },
        { reps: 8, weight: 35 }
      ]
    }
  ]
});

const legsDay = (daysAgo: number, overload = 0): SessionSpec => ({
  title: "Legs Day",
  category: "LEGS",
  daysAgo,
  exercises: [
    {
      name: "Back Squat",
      sets: [
        { reps: 8, weight: 100 + overload },
        { reps: 6, weight: 110 + overload },
        { reps: 4, weight: 120 + overload, rpe: 9 }
      ]
    },
    {
      name: "Romanian Deadlift",
      sets: [
        { reps: 10, weight: 80 + overload },
        { reps: 10, weight: 90 + overload },
        { reps: 8, weight: 100 + overload }
      ]
    },
    {
      name: "Leg Press",
      sets: [
        { reps: 12, weight: 180 },
        { reps: 12, weight: 200 },
        { reps: 10, weight: 220 }
      ]
    },
    {
      name: "Standing Calf Raise",
      sets: [
        { reps: 15, weight: 80 },
        { reps: 15, weight: 90 },
        { reps: 12, weight: 100 }
      ]
    }
  ]
});

function twoWeeksOfPPL(userOverload = 0): SessionSpec[] {
  // 14 days ago → today, 6 sessions per athlete (alternating PPL)
  return [
    pushDay(13, userOverload - 2),
    pullDay(12, userOverload - 2),
    legsDay(11, userOverload - 2),
    pushDay(9, userOverload),
    pullDay(8, userOverload),
    legsDay(7, userOverload),
    pushDay(5, userOverload + 2),
    pullDay(3, userOverload + 2),
    legsDay(1, userOverload + 2)
  ];
}

async function main() {
  console.log("🌱 Seeding IronFeed…");

  // Wipe relevant tables (safe for dev)
  await prisma.$transaction([
    prisma.comment.deleteMany(),
    prisma.like.deleteMany(),
    prisma.pR.deleteMany(),
    prisma.set.deleteMany(),
    prisma.exercise.deleteMany(),
    prisma.workout.deleteMany(),
    prisma.follow.deleteMany(),
    prisma.challenge.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany()
  ]);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "alex@ironfeed.dev",
        username: "alex_lifts",
        name: "Alex Martin",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
        bio: "Chasing a 180kg deadlift.",
        emailVerified: new Date()
      }
    }),
    prisma.user.create({
      data: {
        email: "sam@ironfeed.dev",
        username: "sam_strong",
        name: "Sam Dupont",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=sam",
        bio: "PPL x5 / week. Protein maxing.",
        emailVerified: new Date()
      }
    }),
    prisma.user.create({
      data: {
        email: "jordan@ironfeed.dev",
        username: "jordan_fit",
        name: "Jordan Lee",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=jordan",
        bio: "Powerbuilder. Squat devotee.",
        emailVerified: new Date()
      }
    })
  ]);

  // Mutual follows
  const pairs = [
    [0, 1],
    [1, 0],
    [0, 2],
    [2, 0],
    [1, 2],
    [2, 1]
  ] as const;
  await prisma.follow.createMany({
    data: pairs.map(([a, b]) => ({
      followerId: users[a].id,
      followeeId: users[b].id
    }))
  });

  // Jordan referred Sam
  await prisma.user.update({
    where: { id: users[1].id },
    data: { referredById: users[2].id }
  });

  // Per-user overload profile → Jordan lifts the heaviest
  const overloads = [0, -5, 5];

  for (let u = 0; u < users.length; u++) {
    const user = users[u];
    const sessions = twoWeeksOfPPL(overloads[u]);

    for (const s of sessions) {
      const performedAt = subDays(new Date(), s.daysAgo);

      const workout = await prisma.workout.create({
        data: {
          userId: user.id,
          title: s.title,
          category: s.category,
          notes: s.notes,
          performedAt,
          exercises: {
            create: s.exercises.map((ex, i) => ({
              name: ex.name,
              order: i,
              sets: {
                create: ex.sets.map((set, j) => ({
                  reps: set.reps,
                  weight: set.weight,
                  rpe: set.rpe,
                  order: j
                }))
              }
            }))
          }
        }
      });

      // PR detection per exercise name, per user
      for (const ex of s.exercises) {
        const bestThisWorkout = ex.sets.reduce<{
          weight: number;
          reps: number;
          estimated1RM: number;
        }>(
          (best, set) => {
            const e1 = epley(set.weight, set.reps);
            return e1 > best.estimated1RM
              ? { weight: set.weight, reps: set.reps, estimated1RM: e1 }
              : best;
          },
          { weight: 0, reps: 0, estimated1RM: 0 }
        );

        const prior = await prisma.pR.findFirst({
          where: { userId: user.id, exerciseName: ex.name },
          orderBy: { estimated1RM: "desc" }
        });

        if (!prior || bestThisWorkout.estimated1RM > prior.estimated1RM) {
          await prisma.pR.create({
            data: {
              userId: user.id,
              workoutId: workout.id,
              exerciseName: ex.name,
              weight: bestThisWorkout.weight,
              reps: bestThisWorkout.reps,
              estimated1RM: bestThisWorkout.estimated1RM,
              achievedAt: performedAt
            }
          });
        }
      }
    }
  }

  // Some likes + comments on the most recent workouts
  const recent = await prisma.workout.findMany({
    orderBy: { performedAt: "desc" },
    take: 6
  });

  for (const w of recent) {
    for (const liker of users) {
      if (liker.id === w.userId) continue;
      await prisma.like.upsert({
        where: {
          userId_workoutId: { userId: liker.id, workoutId: w.id }
        },
        update: {},
        create: { userId: liker.id, workoutId: w.id }
      });
    }
    const commenter = users.find((u) => u.id !== w.userId)!;
    await prisma.comment.create({
      data: {
        userId: commenter.id,
        workoutId: w.id,
        body: "Solid session 💪"
      }
    });
  }

  // An active monthly challenge
  const now = new Date();
  await prisma.challenge.create({
    data: {
      slug: "ironchallenge-bench-bodyweight",
      title: "#IronChallenge — Bench Bodyweight",
      description: "Hit a bench press PR equal to or above your bodyweight this month.",
      metric: "bench_1rm",
      startsAt: new Date(now.getFullYear(), now.getMonth(), 1),
      endsAt: new Date(now.getFullYear(), now.getMonth() + 1, 0)
    }
  });

  console.log(`✅ Seeded ${users.length} users with 2 weeks of PPL.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
