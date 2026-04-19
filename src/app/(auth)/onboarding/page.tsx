import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { OnboardingClient } from "./OnboardingClient";

export const metadata = { title: "Onboarding — IronFeed" };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  return (
    <main className="min-h-screen px-6 py-8 max-w-xl mx-auto space-y-4">
      <div>
        <h1 className="text-3xl font-black">Welcome to IronFeed 💪</h1>
        <p className="opacity-70 mt-1">
          Let IronCoach draft a 5-day PPL programme tailored to your goal.
        </p>
      </div>
      <OnboardingClient />
    </main>
  );
}
