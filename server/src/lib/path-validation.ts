import type {
  Block,
  GlossaryEntry,
  Level,
  Scene,
  Step,
  TopicPath,
} from "@fsl/shared";
import {
  LEVELS,
  glossaryUsage,
  numberSteps,
  plainText,
  stepLinks,
  termLinks,
} from "./guided-learning.js";
import { SLUG_PATTERN } from "./slug.js";

/** Steps per level, level check included. */
export const LEVEL_SIZES: Record<Level, [min: number, max: number]> = {
  basic: [12, 20],
  intermediate: [8, 15],
  advanced: [6, 12],
};

/** Size limits from the design's block table, in characters a learner reads. */
export const LIMITS = {
  summary: 220,
  explain: 400,
  analogy: 200,
  keyPoint: 90,
  keyPoints: [3, 5],
  diagramNodes: [2, 6],
  codeLines: 15,
  checkChoices: [2, 4],
  blocksPerStep: [1, 4],
  levelCheckQuestions: [4, 8],
  sceneActors: [2, 5],
  sceneSteps: [3, 12],
  caption: 120,
  short: 160,
  body: 600,
};

/** At most this many lesson steps in a row may have no quick check. */
const STEPS_WITHOUT_CHECK = 2;

/** What path content may point at, from the other registries. */
export type PathRefs = {
  /** Topic ids in reading order (the learning tree's children). */
  topicIds: string[];
  conceptIds: Set<string>;
  exerciseIds: Set<string>;
  fileIds: Set<string>;
  symbolIds: Set<string>;
  flowIds: Set<string>;
};

const outside = (n: number, [min, max]: number[]) => n < min! || n > max!;

function duplicates(values: string[], describe: (value: string) => string) {
  const seen = new Set<string>();
  const reported = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) reported.add(value);
    seen.add(value);
  }
  return [...reported].map(describe);
}

function validateScenes(name: string, scenes: Scene[]): string[] {
  const errors = duplicates(
    scenes.map((scene) => scene.id),
    (id) => `${name} has scene "${id}" more than once.`,
  );
  for (const scene of scenes) {
    const where = `${name} scene "${scene.id}"`;
    if (!scene.title.trim()) errors.push(`${where} needs a title.`);
    if (outside(scene.actors.length, LIMITS.sceneActors)) {
      errors.push(`${where} needs 2–5 actors (has ${scene.actors.length}).`);
    }
    if (outside(scene.steps.length, LIMITS.sceneSteps)) {
      errors.push(`${where} needs 3–12 steps (has ${scene.steps.length}).`);
    }
    const actors = new Set(scene.actors.map((actor) => actor.id));
    scene.steps.forEach((step, index) => {
      for (const end of [step.from, step.to]) {
        if (!actors.has(end)) {
          errors.push(
            `${where} step ${index + 1} uses unknown actor "${end}".`,
          );
        }
      }
      if (!step.caption.trim() || step.caption.length > LIMITS.caption) {
        errors.push(
          `${where} step ${index + 1} needs a caption of at most ${LIMITS.caption} characters.`,
        );
      }
    });
  }
  return errors;
}

function validateBlock(
  where: string,
  block: Block,
  read: (text: string) => string,
  sceneIds: Set<string>,
  refs: PathRefs,
): string[] {
  const errors: string[] = [];
  const tooLong = (text: string, max: number, what: string) => {
    const length = read(text).length;
    if (!read(text).trim() || length > max) {
      errors.push(
        `${where} ${what} needs 1–${max} characters (has ${length}).`,
      );
    }
  };
  switch (block.type) {
    case "explain":
      tooLong(block.text, LIMITS.explain, "explain");
      break;
    case "analogy":
      tooLong(block.text, LIMITS.analogy, "analogy");
      break;
    case "keyPoints":
      if (outside(block.items.length, LIMITS.keyPoints)) {
        errors.push(`${where} keyPoints needs 3–5 items.`);
      }
      block.items.forEach((item, i) =>
        tooLong(item, LIMITS.keyPoint, `key point ${i + 1}`),
      );
      break;
    case "diagram":
      if (outside(block.nodes.length, LIMITS.diagramNodes)) {
        errors.push(`${where} diagram needs 2–6 nodes.`);
      }
      break;
    case "scene":
      if (!sceneIds.has(block.sceneId)) {
        errors.push(`${where} shows unknown scene "${block.sceneId}".`);
      }
      break;
    case "code": {
      const lines = block.example.code.split("\n").length;
      if (lines > LIMITS.codeLines) {
        errors.push(
          `${where} code has ${lines} lines; keep it to ${LIMITS.codeLines}.`,
        );
      }
      for (const note of block.notes ?? []) {
        if (note.line < 1 || note.line > lines) {
          errors.push(
            `${where} code has a note on line ${note.line}, which doesn't exist.`,
          );
        }
      }
      break;
    }
    case "check": {
      const ids = block.choices.map((choice) => choice.id);
      if (outside(ids.length, LIMITS.checkChoices)) {
        errors.push(`${where} quick check needs 2–4 choices.`);
      }
      errors.push(
        ...duplicates(
          ids,
          (id) => `${where} quick check has choice "${id}" twice.`,
        ),
      );
      if (!ids.includes(block.correctChoiceId)) {
        errors.push(
          `${where} quick check's correct choice "${block.correctChoiceId}" is not one of its choices.`,
        );
      }
      if (!block.question.trim() || !block.explanation.trim()) {
        errors.push(
          `${where} quick check needs a question and an explanation.`,
        );
      }
      break;
    }
    case "inTheNotesApp": {
      tooLong(block.text, LIMITS.explain, "inTheNotesApp");
      const links: [string | undefined, Set<string>, string][] = [
        [block.fileId, refs.fileIds, "file"],
        [block.symbolId, refs.symbolIds, "symbol"],
        [block.flowId, refs.flowIds, "flow"],
      ];
      if (links.every(([id]) => id === undefined)) {
        errors.push(
          `${where} inTheNotesApp must link a file, a symbol or a flow.`,
        );
      }
      for (const [id, known, kind] of links) {
        if (id !== undefined && !known.has(id)) {
          errors.push(`${where} inTheNotesApp links unknown ${kind} "${id}".`);
        }
      }
      break;
    }
    case "tryIt":
      break;
  }
  return errors;
}

function validateStep(
  where: string,
  step: Step,
  read: (text: string) => string,
  sceneIds: Set<string>,
  refs: PathRefs,
): string[] {
  const errors: string[] = [];
  if (!SLUG_PATTERN.test(step.id)) {
    errors.push(
      `${where} needs an id of lowercase letters, numbers and single hyphens.`,
    );
  }
  if (!step.title.trim()) errors.push(`${where} needs a title.`);
  if (!Number.isInteger(step.minutes) || step.minutes < 1) {
    errors.push(`${where} needs a whole number of minutes.`);
  }
  const [min, max] = LIMITS.blocksPerStep;
  if (step.kind === "lesson" && outside(step.blocks.length, [min!, max!])) {
    errors.push(`${where} needs 1–4 blocks (has ${step.blocks.length}).`);
  }
  if (step.kind === "check" && step.blocks.length > 1) {
    errors.push(
      `${where} is a level check; it may have one introduction block at most.`,
    );
  }
  if (step.blocks.filter((block) => block.type === "analogy").length > 1) {
    errors.push(`${where} has more than one analogy.`);
  }
  for (const block of step.blocks) {
    errors.push(...validateBlock(where, block, read, sceneIds, refs));
  }
  return errors;
}

function validateLevels(
  name: string,
  path: TopicPath,
  refs: PathRefs,
): string[] {
  const errors: string[] = [];
  const numbered = numberSteps(path);
  const byId = new Map(numbered.map((s) => [s.step.id, s]));
  for (const level of LEVELS) {
    const plan = path.levels[level];
    const where = `${name} ${level}`;
    if (!plan.outcome.trim()) errors.push(`${where} needs an outcome.`);
    const [min, max] = LEVEL_SIZES[level];
    if (plan.steps.length < min || plan.steps.length > max) {
      errors.push(
        `${where} needs ${min}–${max} steps (has ${plan.steps.length}).`,
      );
    }
    const checks = plan.steps.filter((step) => step.kind === "check");
    if (checks.length !== 1 || plan.steps.at(-1)?.kind !== "check") {
      errors.push(`${where} must end with exactly one level check.`);
    }

    // A quick check at least every three lesson steps.
    let without = 0;
    for (const step of plan.steps) {
      if (step.kind !== "lesson") continue;
      without = step.blocks.some((block) => block.type === "check")
        ? 0
        : without + 1;
      if (without > STEPS_WITHOUT_CHECK) {
        errors.push(
          `${where} has three steps in a row without a quick check (up to "${step.id}").`,
        );
        without = 0;
      }
    }

    for (const check of checks) {
      if (check.kind !== "check") continue;
      const at = `${name} step "${check.id}"`;
      if (outside(check.questions.length, LIMITS.levelCheckQuestions)) {
        errors.push(
          `${at} needs 4–8 questions (has ${check.questions.length}).`,
        );
      }
      for (const question of check.questions) {
        if (!refs.exerciseIds.has(question.exerciseId)) {
          errors.push(`${at} asks unknown exercise "${question.exerciseId}".`);
        }
        const tested = byId.get(question.stepId);
        if (
          !tested ||
          tested.level !== level ||
          tested.step.kind !== "lesson"
        ) {
          errors.push(
            `${at} question "${question.exerciseId}" must test a ${level} lesson step, not "${question.stepId}".`,
          );
        }
      }
    }
  }
  return errors;
}

function validateGlossary(entries: GlossaryEntry[], refs: PathRefs): string[] {
  const ids = new Set(entries.map((entry) => entry.id));
  const topics = new Set(refs.topicIds);
  const errors = duplicates(
    entries.map((entry) => entry.id),
    (id) => `Glossary entry "${id}" is defined more than once.`,
  );
  const terms = (id: string) => entries.find((e) => e.id === id)?.term;
  for (const entry of entries) {
    const name = `Glossary entry "${entry.id}"`;
    if (!SLUG_PATTERN.test(entry.id)) {
      errors.push(
        `${name} needs an id of lowercase letters, numbers and single hyphens.`,
      );
    }
    if (!topics.has(entry.topicId)) {
      errors.push(`${name} belongs to unknown topic "${entry.topicId}".`);
    }
    if (!entry.term.trim()) errors.push(`${name} needs a term.`);
    const sized: [string | undefined, number, string][] = [
      [entry.short, LIMITS.short, "short"],
      [entry.body, LIMITS.body, "body"],
      [entry.analogy, LIMITS.analogy, "analogy"],
    ];
    for (const [text, max, field] of sized) {
      if (text === undefined && field === "analogy") continue;
      const length = plainText(text ?? "", terms).length;
      if (!text?.trim() || length > max) {
        errors.push(
          `${name} needs a ${field} of 1–${max} characters (has ${length}).`,
        );
      }
    }
    for (const link of termLinks(entry.body)) {
      if (!ids.has(link.id)) {
        errors.push(`${name} links unknown glossary entry "${link.id}".`);
      }
    }
    if (
      entry.conceptPageId !== undefined &&
      !refs.conceptIds.has(entry.conceptPageId)
    ) {
      errors.push(
        `${name} points at unknown concept page "${entry.conceptPageId}".`,
      );
    }
  }
  return errors;
}

/**
 * Checks the guided paths and the glossary: sizes, numbering rules, level
 * checks, and that every `[[link]]` resolves and is introduced in time.
 */
export function validatePaths(
  paths: TopicPath[],
  entries: GlossaryEntry[],
  refs: PathRefs,
): string[] {
  const errors = [
    ...duplicates(
      paths.map((path) => path.topicId),
      (id) => `Topic "${id}" has more than one path.`,
    ),
    ...validateGlossary(entries, refs),
  ];
  const order = (topicId: string) => refs.topicIds.indexOf(topicId);
  paths.slice(1).forEach((path, i) => {
    if (order(path.topicId) < order(paths[i]!.topicId)) {
      errors.push(
        `Path "${path.topicId}" comes before "${paths[i]!.topicId}" in the learning tree; list paths in reading order.`,
      );
    }
  });

  const entryById = new Map(entries.map((entry) => [entry.id, entry]));
  const read = (text: string) =>
    plainText(text, (id) => entryById.get(id)?.term);

  for (const path of paths) {
    const name = `Path "${path.topicId}"`;
    if (order(path.topicId) < 0) {
      errors.push(`${name} is for unknown topic "${path.topicId}".`);
    }
    for (const field of ["what", "does", "how"] as const) {
      const text = path.summary[field];
      if (!text.trim() || text.length > LIMITS.summary) {
        errors.push(
          `${name} summary "${field}" needs 1–${LIMITS.summary} characters.`,
        );
      }
    }
    errors.push(...validateScenes(name, path.scenes));
    const sceneIds = new Set(path.scenes.map((scene) => scene.id));
    if (!sceneIds.has(path.overviewSceneId)) {
      errors.push(
        `${name} has unknown overview scene "${path.overviewSceneId}".`,
      );
    }
    const numbered = numberSteps(path);
    errors.push(
      ...duplicates(
        numbered.map((s) => s.step.id),
        (id) => `${name} has step id "${id}" more than once.`,
      ),
    );
    for (const { number, step } of numbered) {
      const where = `${name} step ${number} "${step.id}"`;
      errors.push(...validateStep(where, step, read, sceneIds, refs));
      for (const id of stepLinks(step)) {
        if (!entryById.has(id)) {
          errors.push(`${where} links unknown glossary entry "${id}".`);
        }
      }
    }
    errors.push(...validateLevels(name, path, refs));
  }

  // Introduced in its own topic; never leaned on before it is taught.
  const usage = glossaryUsage(paths, entries);
  const withPath = new Set(paths.map((path) => path.topicId));
  const rank = (level: Level) => LEVELS.indexOf(level);
  for (const entry of entries) {
    const { introducedIn, usedIn } = usage.get(entry.id)!;
    const name = `Glossary entry "${entry.id}"`;
    if (!introducedIn) {
      // Topics without a path yet can't introduce their entries.
      if (withPath.has(entry.topicId)) {
        errors.push(`${name} is not linked by any step of "${entry.topicId}".`);
      }
      continue;
    }
    for (const use of usedIn) {
      if (use.topicId === entry.topicId) continue;
      if (order(use.topicId) < order(entry.topicId)) {
        errors.push(
          `${name} is linked in "${use.topicId}" step ${use.number}, before its topic "${entry.topicId}" teaches it.`,
        );
      } else if (rank(use.level) < rank(introducedIn.level)) {
        errors.push(
          `${name} is linked in ${use.level} step ${use.number} of "${use.topicId}", but only taught in ${introducedIn.level} (step ${introducedIn.number} of "${entry.topicId}").`,
        );
      }
    }
  }
  return errors;
}
