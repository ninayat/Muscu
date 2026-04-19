"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";

export function LikeButton({
  workoutId,
  initialLiked,
  initialCount
}: {
  workoutId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, start] = useTransition();

  const toggle = () => {
    setLiked((v) => !v);
    setCount((c) => c + (liked ? -1 : 1));
    start(async () => {
      const res = await fetch(`/api/workouts/${workoutId}/like`, {
        method: "POST"
      });
      if (!res.ok) {
        setLiked(initialLiked);
        setCount(initialCount);
        return;
      }
      const data = (await res.json()) as { liked: boolean; count: number };
      setLiked(data.liked);
      setCount(data.count);
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={cn(
        "btn-ghost text-sm",
        liked ? "text-pull" : "text-black/70 dark:text-white/70"
      )}
    >
      {liked ? "❤" : "🤍"} {count}
    </button>
  );
}
