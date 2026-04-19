export function PRBadge({ count = 1 }: { count?: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-legs/15 text-legs-700 dark:text-legs-50 px-2 py-0.5 text-xs font-bold">
      🏅 PR{count > 1 ? ` ×${count}` : ""}
    </span>
  );
}
