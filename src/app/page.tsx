import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/feed");

  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-push flex items-center justify-center text-white font-black">
            IF
          </div>
          <span className="font-bold text-lg">IronFeed</span>
        </div>
        <Link href="/signin" className="btn-ghost">
          Sign in
        </Link>
      </header>

      <section className="flex-1 px-6 flex flex-col items-center justify-center text-center max-w-xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
          Log. Share. <span className="text-push">Get stronger.</span>
        </h1>
        <p className="mt-4 text-black/70 dark:text-white/70">
          The Strava for lifters. Auto-detect PRs, crush weekly volume challenges
          with friends, and get coached by IronCoach AI.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/signin" className="btn-primary">
            Start lifting
          </Link>
          <Link href="/leaderboard" className="btn-ghost">
            Peek the leaderboard
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-3 w-full">
          <div className="card p-4 text-left">
            <div className="chip-push mb-2">Push</div>
            <p className="text-xs opacity-70">Bench, OHP, triceps</p>
          </div>
          <div className="card p-4 text-left">
            <div className="chip-pull mb-2">Pull</div>
            <p className="text-xs opacity-70">Deadlift, rows, curls</p>
          </div>
          <div className="card p-4 text-left">
            <div className="chip-legs mb-2">Legs</div>
            <p className="text-xs opacity-70">Squat, RDL, calves</p>
          </div>
        </div>
      </section>

      <footer className="px-6 py-6 text-center text-xs opacity-50">
        © {new Date().getFullYear()} IronFeed
      </footer>
    </main>
  );
}
