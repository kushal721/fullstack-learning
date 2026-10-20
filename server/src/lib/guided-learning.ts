import type { Block, GlossaryEntry, Level, Step, TopicPath } from "@fsl/shared";

/** The levels in reading order: Basic first, then Intermediate, then Advanced. */
export const LEVELS: readonly Level[] = ["basic", "intermediate", "advanced"];

/** A step with the number the learner sees and the level it belongs to. */
export type NumberedStep = { number: number; level: Level; step: Step };

/**
 * Numbers a path's steps straight through the topic, so Intermediate carries
 * on where Basic stops (Basic 1–18, Intermediate 19–30, …).
 */
export function numberSteps(path: TopicPath): NumberedStep[] {
  return LEVELS.flatMap((level) =>
    path.levels[level].steps.map((step) => ({ level, step })),
  ).map((entry, index) => ({ number: index + 1, ...entry }));
}

/** `[[dns]]` or `[[ip-address|IP addresses]]`. */
const LINK = /\[\[([^\]|]*)(?:\|([^\]]*))?\]\]/g;

/** The glossary links in a text, in order: `{ id, label }`. */
export function termLinks(text: string): { id: string; label?: string }[] {
  return [...text.matchAll(LINK)].map(([, id, label]) => ({
    id: id!,
    ...(label === undefined ? {} : { label }),
  }));
}

/**
 * The text a learner reads: links become their label (or the entry's term,
 * or the id when the entry is unknown). Size limits count this text.
 */
export function plainText(
  text: string,
  terms: (id: string) => string | undefined = () => undefined,
): string {
  return text.replace(
    LINK,
    (_, id: string, label?: string) => label ?? terms(id) ?? id,
  );
}

/** Every text in a block that may contain glossary links. */
export function blockTexts(block: Block): string[] {
  switch (block.type) {
    case "explain":
    case "analogy":
    case "inTheNotesApp":
      return [block.text];
    case "keyPoints":
      return block.items;
    case "check":
      return [
        block.question,
        ...block.choices.map((choice) => choice.text),
        block.explanation,
      ];
    default:
      return [];
  }
}

/** The glossary ids a step links, each once, in reading order. */
export function stepLinks(step: Step): string[] {
  const ids = step.blocks
    .flatMap(blockTexts)
    .flatMap((text) => termLinks(text).map((link) => link.id));
  return [...new Set(ids)];
}

/** Where a step is: its topic, id, number and level. */
export type StepRef = {
  topicId: string;
  stepId: string;
  number: number;
  level: Level;
};

export type GlossaryUsage = {
  /** The first step of the entry's own topic that links it. */
  introducedIn?: StepRef;
  /** Every step (any topic) that links it, in reading order. */
  usedIn: StepRef[];
};

/**
 * Where each glossary entry is introduced and used. `paths` must be in
 * reading order. Links to unknown ids are ignored (validation reports them).
 */
export function glossaryUsage(
  paths: TopicPath[],
  entries: GlossaryEntry[],
): Map<string, GlossaryUsage> {
  const usage = new Map<string, GlossaryUsage>(
    entries.map((entry) => [entry.id, { usedIn: [] }]),
  );
  const topicOf = new Map(entries.map((entry) => [entry.id, entry.topicId]));
  for (const path of paths) {
    for (const { number, level, step } of numberSteps(path)) {
      const ref = { topicId: path.topicId, stepId: step.id, number, level };
      for (const id of stepLinks(step)) {
        const entry = usage.get(id);
        if (!entry) continue;
        entry.usedIn.push(ref);
        if (!entry.introducedIn && topicOf.get(id) === path.topicId) {
          entry.introducedIn = ref;
        }
      }
    }
  }
  return usage;
}
