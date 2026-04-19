"use client";

import { useState } from "react";
import Link from "next/link";

type Day = {
  day: string;
  category: "PUSH" | "PULL" | "LEGS";
  exercises: { name: string; sets: number; reps: string; notes?: string }[];
};

export function OnboardingClient() {
  const [goal, setGoal] = useState("Build strength and lean mass");
  const [experience, setExperience] = useState("intermediate");
  const [plan, setPlan] = useState<Day[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<string | null>(null);

  const generate = async () => {
    setBusy(true);
    setError(null);
    setPlan(null);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: "program",
          message: `Generate a 5-day PPL programme. Goal: ${goal}. Experience: ${experience}. Return ONLY valid JSON matching the schema.`
        })
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || !data.text) throw new Error(data.error ?? "coach error");
      setRaw(data.text);
      try {
        const match = data.text.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(match?.[0] ?? data.text) as { days: Day[] };
        setPlan(parsed.days);
      } catch {
        setError(
          "Coach responded but JSON parsing failed. You can still read the raw reply below."
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="card p-4 space-y-3">
        <label className="block">
          <span className="text-sm opacity-70">Your main goal</span>
          <input
            className="input mt-1"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-sm opacity-70">Experience level</span>
          <select
            className="input mt-1"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          >
            <option value="beginner">Beginner (&lt;1 year)</option>
            <option value="intermediate">Intermediate (1–3 years)</option>
            <option value="advanced">Advanced (3+ years)</option>
          </select>
        </label>
        <button className="btn-primary w-full" onClick={generate} disabled={busy}>
          {busy ? "Generating…" : "Generate my programme"}
        </button>
      </div>

      {error && (
        <div className="card p-4 text-sm text-red-500 bg-red-500/10">
          {error}
        </div>
      )}

      {plan && (
        <div className="space-y-3">
          {plan.map((d, i) => (
            <div key={i} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">
                  {d.day} · <span className="opacity-60">{d.category}</span>
                </h3>
              </div>
              <ul className="text-sm space-y-1">
                {d.exercises?.map((ex, j) => (
                  <li key={j} className="flex justify-between">
                    <span>{ex.name}</span>
                    <span className="opacity-70">
                      {ex.sets} × {ex.reps}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <Link href="/feed" className="btn-primary w-full">
            Start lifting
          </Link>
        </div>
      )}

      {!plan && raw && (
        <pre className="card p-4 text-xs whitespace-pre-wrap">{raw}</pre>
      )}
    </div>
  );
}
