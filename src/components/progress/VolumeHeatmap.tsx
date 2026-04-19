"use client";

import { startOfDay, subDays, format } from "date-fns";

export function VolumeHeatmap({
  daily
}: {
  daily: { date: string; volume: number }[];
}) {
  // Build a 53-week × 7-day grid ending today.
  const today = startOfDay(new Date());
  const days: { date: Date; iso: string; volume: number }[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = subDays(today, i);
    const iso = format(d, "yyyy-MM-dd");
    const match = daily.find((x) => x.date === iso);
    days.push({ date: d, iso, volume: match?.volume ?? 0 });
  }

  const maxVol = Math.max(1, ...days.map((d) => d.volume));
  const shade = (v: number) => {
    if (v === 0) return "bg-black/10 dark:bg-white/5";
    const ratio = v / maxVol;
    if (ratio > 0.75) return "bg-push-700";
    if (ratio > 0.5) return "bg-push-600";
    if (ratio > 0.25) return "bg-push-500";
    return "bg-push-500/50";
  };

  // Layout: 53 columns (weeks), 7 rows (Mon..Sun).
  // Pad front so the first column starts on Monday.
  const firstDay = days[0].date.getDay(); // 0=Sun
  const mondayOffset = (firstDay + 6) % 7; // days since Monday
  const padded: (typeof days[number] | null)[] = [
    ...Array.from({ length: mondayOffset }, () => null),
    ...days
  ];
  // Ensure length multiple of 7
  while (padded.length % 7 !== 0) padded.push(null);

  const weeks: (typeof padded[number])[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  return (
    <div className="card p-4">
      <h3 className="font-semibold mb-3">Weekly volume</h3>
      <div className="flex gap-[3px] overflow-x-auto">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((d, di) =>
              d ? (
                <div
                  key={di}
                  title={`${d.iso} — ${Math.round(d.volume)}kg`}
                  className={`w-[10px] h-[10px] rounded-[2px] ${shade(d.volume)}`}
                />
              ) : (
                <div key={di} className="w-[10px] h-[10px]" />
              )
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-[11px] opacity-70">
        Less
        <span className="w-[10px] h-[10px] bg-black/10 dark:bg-white/5 rounded-[2px]" />
        <span className="w-[10px] h-[10px] bg-push-500/50 rounded-[2px]" />
        <span className="w-[10px] h-[10px] bg-push-500 rounded-[2px]" />
        <span className="w-[10px] h-[10px] bg-push-600 rounded-[2px]" />
        <span className="w-[10px] h-[10px] bg-push-700 rounded-[2px]" />
        More
      </div>
    </div>
  );
}
