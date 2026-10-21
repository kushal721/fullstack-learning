import type { Level, LevelSummary, StepSummary } from "@fsl/shared";
import type { PathProgress } from "../../hooks/usePathProgress.ts";

/** How each level is named and coloured, everywhere it appears. */
export const LEVEL_STYLE: Record<
  Level,
  { name: string; tone: "success" | "info" | "warning"; dot: string }
> = {
  basic: { name: "Basic", tone: "success", dot: "bg-green-600" },
  intermediate: { name: "Intermediate", tone: "info", dot: "bg-accent" },
  advanced: { name: "Advanced", tone: "warning", dot: "bg-amber-500" },
};

export function doneIn(level: LevelSummary, done: string[]): number {
  return level.steps.filter((step) => done.includes(step.id)).length;
}

/** Where switching to a level lands: the last step there, else the first not done. */
export function resumeStep(
  level: LevelSummary,
  progress: Pick<PathProgress, "done" | "lastStep">,
): StepSummary {
  const last = level.steps.find(
    (step) => step.id === progress.lastStep[level.level],
  );
  return (
    last ??
    level.steps.find((step) => !progress.done.includes(step.id)) ??
    level.steps[0]!
  );
}

export const stepHref = (topicSlug: string, stepId?: string) =>
  stepId ? `/learn/${topicSlug}/${stepId}` : `/learn/${topicSlug}`;

/**
 * The glossary panel lives in the URL: `?term=<id>` shows an entry,
 * `?find=<text>` searches (empty: the A–Z list). Neither: closed.
 */
export function glossaryHref(
  search: string,
  view: { term: string } | { find: string } | null,
) {
  const params = new URLSearchParams(search);
  params.delete("term");
  params.delete("find");
  if (view && "term" in view) params.set("term", view.term);
  if (view && "find" in view) params.set("find", view.find);
  const query = params.toString();
  return query ? `?${query}` : "?";
}

/** Opens the glossary panel on an entry, keeping the page where it is. */
export const termHref = (search: string, id: string) =>
  glossaryHref(search, { term: id });

/**
 * How a glossary link without its own label reads in running text: its
 * name, starting lowercase mid-sentence ("asks the client"). Acronyms
 * (HTML), names with inner capitals (JavaScript), dotted names (Node.js)
 * and proper nouns (React) keep their capitals.
 */
export function termInText(
  entry: { term: string; properNoun?: boolean },
  startsSentence: boolean,
): string {
  const { term } = entry;
  const keepsCapital =
    startsSentence ||
    entry.properNoun ||
    /^[A-Z]{2}/.test(term) ||
    /.[A-Z]/.test(term) ||
    term.includes(".");
  return keepsCapital ? term : term.charAt(0).toLowerCase() + term.slice(1);
}
