"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/signin" })}
      className="text-xs px-2 py-1 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition"
      aria-label="Sign out"
      title="Sign out"
    >
      ↪
    </button>
  );
}
