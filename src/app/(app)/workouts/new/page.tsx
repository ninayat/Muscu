import { ExerciseLogger } from "@/components/workout/ExerciseLogger";

export const metadata = { title: "Log workout — IronFeed" };

export default function NewWorkoutPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Log a workout</h1>
      <ExerciseLogger />
    </div>
  );
}
