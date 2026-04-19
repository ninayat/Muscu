"use client";

import { useState } from "react";

export function InviteActions({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share({
          title: "Join me on IronFeed",
          text: "Log your workouts, crush PRs and get coached by IronCoach AI.",
          url
        });
      } catch {
        /* user dismissed */
      }
    } else {
      copy();
    }
  };

  return (
    <div className="flex gap-2">
      <button onClick={copy} className="btn-ghost flex-1">
        {copied ? "Copied ✓" : "Copy link"}
      </button>
      <button onClick={share} className="btn-primary flex-1">
        Share
      </button>
    </div>
  );
}
