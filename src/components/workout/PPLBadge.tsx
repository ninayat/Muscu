import { PPL_META } from "@/lib/ppl";
import type { Category } from "@prisma/client";

export function PPLBadge({ category }: { category: Category }) {
  const m = PPL_META[category];
  return <span className={m.chip}>{m.emoji} {m.label}</span>;
}
