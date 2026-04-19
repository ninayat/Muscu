"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const items = [
  { href: "/feed", label: "Feed", icon: "🏠" },
  { href: "/workouts/new", label: "Log", icon: "➕" },
  { href: "/progress", label: "Progress", icon: "📈" },
  { href: "/leaderboard", label: "Friends", icon: "🏆" },
  { href: "/coach", label: "Coach", icon: "🧠" }
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-black/10 dark:border-white/10 bg-white/90 dark:bg-ink-900/90 backdrop-blur">
      <ul className="grid grid-cols-5 max-w-xl mx-auto">
        {items.map((it) => {
          const active =
            pathname === it.href ||
            (it.href !== "/feed" && pathname.startsWith(it.href));
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={cn(
                  "flex flex-col items-center justify-center py-2 text-xs",
                  active
                    ? "text-push font-semibold"
                    : "text-black/60 dark:text-white/60"
                )}
              >
                <span className="text-lg leading-none">{it.icon}</span>
                <span className="mt-1">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
