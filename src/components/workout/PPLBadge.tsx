import { PPL_META, toCategory } from "@/lib/ppl";

export function PPLBadge({ category }: { category: string }) {
  const m = PPL_META[toCategory(category)];
  return <span className={m.chip}>{m.emoji} {m.label}</span>;
}
