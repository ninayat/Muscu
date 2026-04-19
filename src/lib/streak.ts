import { differenceInCalendarDays, startOfDay } from "date-fns";

/**
 * Count consecutive days (ending today or yesterday) with at least one workout.
 */
export function computeStreak(workoutDates: Date[]): number {
  if (!workoutDates.length) return 0;
  const daySet = new Set(
    workoutDates.map((d) => startOfDay(d).toISOString())
  );
  const today = startOfDay(new Date());

  // Allow streak to continue if last workout was yesterday (not today yet).
  let cursor = today;
  let streak = 0;
  const yesterday = startOfDay(new Date(today.getTime() - 24 * 60 * 60 * 1000));
  if (!daySet.has(today.toISOString()) && daySet.has(yesterday.toISOString())) {
    cursor = yesterday;
  }

  while (daySet.has(cursor.toISOString())) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
  }
  return streak;
}

export const daysSince = (d: Date) => differenceInCalendarDays(new Date(), d);
