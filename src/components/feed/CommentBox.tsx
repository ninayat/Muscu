"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function CommentBox({ workoutId }: { workoutId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    start(async () => {
      const res = await fetch(`/api/workouts/${workoutId}/comment`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body })
      });
      if (res.ok) {
        setBody("");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <input
        className="input"
        placeholder="Say something…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={500}
      />
      <button className="btn-primary" disabled={pending || !body.trim()}>
        Send
      </button>
    </form>
  );
}
