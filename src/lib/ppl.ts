import type { Category } from "@prisma/client";

export const PPL_META: Record<Category, { label: string; color: string; bg: string; chip: string; emoji: string }> = {
  PUSH: { label: "Push", color: "#185FA5", bg: "bg-push", chip: "chip-push", emoji: "💥" },
  PULL: { label: "Pull", color: "#1D9E75", bg: "bg-pull", chip: "chip-pull", emoji: "🪝" },
  LEGS: { label: "Legs", color: "#BA7517", bg: "bg-legs", chip: "chip-legs", emoji: "🦵" },
  OTHER: { label: "Other", color: "#64748B", bg: "bg-slate-500", chip: "chip", emoji: "🏋️" }
};

export const PPL_TEMPLATE: Record<Exclude<Category, "OTHER">, string[]> = {
  PUSH: ["Bench Press", "Overhead Press", "Incline Dumbbell Press", "Triceps Pushdown", "Lateral Raise"],
  PULL: ["Deadlift", "Pull Up", "Barbell Row", "Face Pull", "Barbell Curl"],
  LEGS: ["Back Squat", "Romanian Deadlift", "Leg Press", "Leg Curl", "Standing Calf Raise"]
};
