"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PPL_TEMPLATE } from "@/lib/ppl";
import { RestTimer } from "@/components/workout/RestTimer";
import type { Category } from "@/lib/ppl";

type SetInput = { reps: string; weight: string; rpe?: string };
type ExerciseInput = { name: string; sets: SetInput[] };

const emptySet = (): SetInput => ({ reps: "", weight: "" });

function seedExercises(cat: Category): ExerciseInput[] {
  const names =
    cat === "PUSH" || cat === "PULL" || cat === "LEGS"
      ? PPL_TEMPLATE[cat]
      : ["Exercise 1"];
  return names.slice(0, 4).map((name) => ({
    name,
    sets: [emptySet(), emptySet(), emptySet()]
  }));
}

export function ExerciseLogger() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>("PUSH");
  const [title, setTitle] = useState("Push Day");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<ExerciseInput[]>(() =>
    seedExercises("PUSH")
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const volume = useMemo(
    () =>
      exercises.reduce(
        (t, ex) =>
          t +
          ex.sets.reduce(
            (s, st) =>
              s + (Number(st.weight) || 0) * (Number(st.reps) || 0),
            0
          ),
        0
      ),
    [exercises]
  );

  const changeCategory = (c: Category) => {
    setCategory(c);
    setTitle(c === "OTHER" ? "Workout" : `${c[0]}${c.slice(1).toLowerCase()} Day`);
    setExercises(seedExercises(c));
  };

  const updateSet = (ei: number, si: number, patch: Partial<SetInput>) => {
    setExercises((xs) =>
      xs.map((ex, i) =>
        i === ei
          ? {
              ...ex,
              sets: ex.sets.map((s, j) => (j === si ? { ...s, ...patch } : s))
            }
          : ex
      )
    );
  };

  const addSet = (ei: number) =>
    setExercises((xs) =>
      xs.map((ex, i) =>
        i === ei ? { ...ex, sets: [...ex.sets, emptySet()] } : ex
      )
    );

  const addExercise = () =>
    setExercises((xs) => [
      ...xs,
      { name: "New exercise", sets: [emptySet(), emptySet(), emptySet()] }
    ]);

  const removeExercise = (ei: number) =>
    setExercises((xs) => xs.filter((_, i) => i !== ei));

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const payload = {
        title,
        category,
        notes: notes || undefined,
        exercises: exercises
          .map((ex) => ({
            name: ex.name.trim(),
            sets: ex.sets
              .map((s) => ({
                reps: Number(s.reps),
                weight: Number(s.weight),
                rpe: s.rpe ? Number(s.rpe) : undefined
              }))
              .filter((s) => s.reps > 0 && s.weight >= 0)
          }))
          .filter((ex) => ex.name && ex.sets.length > 0)
      };

      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      const data = (await res.json()) as { id: string };
      router.push(`/workouts/${data.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <RestTimer />

      <div className="card p-4 space-y-3">
        <div className="grid grid-cols-4 gap-2">
          {(["PUSH", "PULL", "LEGS", "OTHER"] as Category[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => changeCategory(c)}
              className={
                category === c
                  ? c === "PUSH"
                    ? "btn bg-push text-white"
                    : c === "PULL"
                      ? "btn bg-pull text-white"
                      : c === "LEGS"
                        ? "btn bg-legs text-white"
                        : "btn bg-ink-800 text-white"
                  : "btn-ghost"
              }
            >
              {c[0] + c.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
        <textarea
          className="input min-h-[60px]"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (how did it feel?)"
        />
      </div>

      {exercises.map((ex, ei) => (
        <div key={ei} className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <input
              className="input text-base font-semibold"
              value={ex.name}
              onChange={(e) =>
                setExercises((xs) =>
                  xs.map((x, i) =>
                    i === ei ? { ...x, name: e.target.value } : x
                  )
                )
              }
            />
            <button
              onClick={() => removeExercise(ei)}
              className="btn-ghost text-xs ml-2"
              type="button"
            >
              Remove
            </button>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-[32px_1fr_1fr_64px] gap-2 text-xs opacity-60 px-1">
              <div>#</div>
              <div>Weight (kg)</div>
              <div>Reps</div>
              <div>RPE</div>
            </div>
            {ex.sets.map((s, si) => (
              <div
                key={si}
                className="grid grid-cols-[32px_1fr_1fr_64px] gap-2 items-center"
              >
                <div className="text-center text-xs opacity-60">{si + 1}</div>
                <input
                  inputMode="decimal"
                  className="input"
                  value={s.weight}
                  onChange={(e) => updateSet(ei, si, { weight: e.target.value })}
                />
                <input
                  inputMode="numeric"
                  className="input"
                  value={s.reps}
                  onChange={(e) => updateSet(ei, si, { reps: e.target.value })}
                />
                <input
                  inputMode="decimal"
                  className="input"
                  placeholder="—"
                  value={s.rpe ?? ""}
                  onChange={(e) => updateSet(ei, si, { rpe: e.target.value })}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addSet(ei)}
              className="btn-ghost w-full text-sm"
            >
              + Add set
            </button>
          </div>
        </div>
      ))}

      <button onClick={addExercise} className="btn-ghost w-full">
        + Add exercise
      </button>

      <div className="card p-3 flex items-center justify-between">
        <div className="text-sm">
          Total volume:{" "}
          <span className="font-bold">{Math.round(volume)} kg</span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 rounded-xl p-3">
          {error}
        </p>
      )}

      <button onClick={submit} className="btn-primary w-full" disabled={busy}>
        {busy ? "Saving…" : "Save workout"}
      </button>
    </div>
  );
}
