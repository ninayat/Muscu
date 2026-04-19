"use client";

import { useState } from "react";

type Msg = { role: "user" | "coach"; text: string };

const suggestions = [
  "Am I plateauing on bench?",
  "Design me a 4-week cut progression.",
  "Should I deload next week?",
  "Swap overhead press — my shoulder aches."
];

export function CoachChat() {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [error, setError] = useState<string | null>(null);

  const send = async (text: string) => {
    if (!text.trim()) return;
    setBusy(true);
    setError(null);
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || !data.text) {
        throw new Error(data.error ?? "coach error");
      }
      setMessages((m) => [...m, { role: "coach", text: data.text! }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Coach failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        {messages.length === 0 && (
          <div className="card p-4 space-y-2">
            <p className="text-sm opacity-80">Try one of these:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="chip bg-push/10 text-push-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`card p-4 ${
              m.role === "user"
                ? "bg-push/10 border-push/30"
                : "bg-white dark:bg-ink-800"
            }`}
          >
            <div className="text-xs uppercase opacity-60 mb-1">
              {m.role === "user" ? "You" : "Coach"}
            </div>
            <div className="whitespace-pre-wrap text-sm">{m.text}</div>
          </div>
        ))}
        {busy && (
          <div className="card p-4 text-sm opacity-70">Coach is thinking…</div>
        )}
        {error && (
          <div className="card p-4 text-sm text-red-500 bg-red-500/10">
            {error}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 sticky bottom-20 bg-ink-50 dark:bg-ink-900 py-2"
      >
        <input
          className="input"
          placeholder="Ask coach…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn-primary" disabled={busy || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
