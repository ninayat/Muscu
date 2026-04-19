"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useMemo, useState } from "react";

type Row = { date: string; value: number };
type Series = { exercise: string; data: Row[] };

export function MaxWeightChart({ series }: { series: Series[] }) {
  const [selected, setSelected] = useState(series[0]?.exercise ?? "");
  const data = useMemo(
    () => series.find((s) => s.exercise === selected)?.data ?? [],
    [series, selected]
  );

  if (series.length === 0) {
    return (
      <div className="card p-4 text-sm opacity-70">
        Log some workouts to see your top-set progression here.
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Max weight over time</h3>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="input max-w-[180px]"
        >
          {series.map((s) => (
            <option key={s.exercise} value={s.exercise}>
              {s.exercise}
            </option>
          ))}
        </select>
      </div>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="date" stroke="currentColor" tick={{ fontSize: 11 }} />
            <YAxis stroke="currentColor" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: "rgba(14,17,22,.95)",
                border: "1px solid rgba(255,255,255,.1)",
                borderRadius: 12
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#185FA5"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
