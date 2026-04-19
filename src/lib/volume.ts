export type VolumeSet = { weight: number; reps: number };

export const setVolume = (s: VolumeSet) => s.weight * s.reps;

export const totalVolume = (sets: VolumeSet[]) =>
  sets.reduce((sum, s) => sum + setVolume(s), 0);

export function workoutVolume(
  exercises: { sets: VolumeSet[] }[]
): number {
  return exercises.reduce((sum, ex) => sum + totalVolume(ex.sets), 0);
}

export function formatKg(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}t`;
  return `${Math.round(n)}kg`;
}
