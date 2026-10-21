import type { GlossaryEntrySummary } from "@fsl/shared";

/** Lowercase, letters and digits only, single spaces: "Look-up!" → "look up". */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9/ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const names = (entry: GlossaryEntrySummary) =>
  [entry.term, entry.id, ...(entry.aliases ?? [])].map(normalize);

/** Singular and plural read the same: "cookies" finds "cookie". */
const stem = (word: string) => word.replace(/s$/, "");

/**
 * Entries matching `query`, best first: an exact name or alias, then names
 * that start with it, then names that contain it, then one-line answers
 * that mention it. Ties are A to Z.
 */
export function searchGlossary(
  entries: GlossaryEntrySummary[],
  query: string,
): GlossaryEntrySummary[] {
  const q = normalize(query);
  if (!q) return [];
  return entries
    .map((entry) => {
      const all = names(entry);
      const score = all.some((n) => stem(n) === stem(q))
        ? 4
        : all.some((n) => n.startsWith(q))
          ? 3
          : all.some((n) => n.includes(q))
            ? 2
            : normalize(entry.short).includes(q)
              ? 1
              : 0;
      return { entry, score };
    })
    .filter((match) => match.score > 0)
    .sort(
      (a, b) => b.score - a.score || a.entry.term.localeCompare(b.entry.term),
    )
    .map((match) => match.entry);
}

/** The entry whose name or alias is exactly `text`, for "Look up". */
export function exactEntry(
  entries: GlossaryEntrySummary[],
  text: string,
): GlossaryEntrySummary | undefined {
  const q = stem(normalize(text));
  return entries.find((entry) => names(entry).some((n) => stem(n) === q));
}
