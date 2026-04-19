import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CoachChat } from "./CoachChat";

export const metadata = { title: "AI Coach — IronFeed" };

export default async function CoachPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">IronCoach</h1>
        <p className="text-xs opacity-60">
          Ask about plateaus, deloads, exercise swaps. Claude sees your last 14
          days of workouts.
        </p>
      </div>
      <CoachChat />
    </div>
  );
}
