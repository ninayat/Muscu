export function StreakCounter({ days }: { days: number }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className="text-3xl">🔥</div>
      <div>
        <div className="text-xl font-black">{days} day{days === 1 ? "" : "s"}</div>
        <div className="text-xs opacity-60">Current streak</div>
      </div>
    </div>
  );
}
