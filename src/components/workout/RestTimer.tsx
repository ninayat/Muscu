"use client";

import { useEffect, useRef, useState } from "react";

const PRESETS = [60, 90, 120, 180];

export function RestTimer() {
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/buzzer.mp3");
    audioRef.current.preload = "auto";
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setRunning(false);
          try {
            audioRef.current?.play().catch(() => {});
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              navigator.vibrate([200, 100, 200]);
            }
          } catch {
            /* no-op */
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const start = (seconds: number) => {
    // Unlock audio on first user interaction
    audioRef.current?.play().then(() => audioRef.current?.pause()).catch(() => {});
    setRemaining(seconds);
    setRunning(true);
  };

  const stop = () => {
    setRunning(false);
    setRemaining(0);
  };

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="card p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="text-2xl font-black tabular-nums w-20 text-center">
          {mm}:{ss}
        </div>
        <div className="flex gap-1">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => start(p)}
              className="btn-ghost px-2 py-1 text-xs"
            >
              {p}s
            </button>
          ))}
        </div>
      </div>
      {running ? (
        <button onClick={stop} className="btn-primary">
          Stop
        </button>
      ) : (
        <span className="text-xs opacity-60">Rest timer</span>
      )}
    </div>
  );
}
