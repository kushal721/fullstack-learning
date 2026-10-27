import type {
  Block,
  CodeExample,
  LevelCheckQuestion,
  Step,
  TraceStep,
  TryItWidget,
} from "@fsl/shared";

// Short ways to write a guided path's steps and blocks, so the step files
// read like the lesson itself. `npm run validate` checks every rule.

export const explain = (text: string): Block => ({ type: "explain", text });
export const analogy = (text: string): Block => ({ type: "analogy", text });
export const keyPoints = (...items: string[]): Block => ({
  type: "keyPoints",
  items,
});
/** Boxes left to right; `twoWay` draws ⇄ instead of →. */
export const diagram = (
  nodes: [label: string, sub?: string][],
  twoWay = false,
): Block => ({
  type: "diagram",
  nodes: nodes.map(([label, sub]) => (sub ? { label, sub } : { label })),
  ...(twoWay ? { twoWay } : {}),
});
export const scene = (sceneId: string): Block => ({ type: "scene", sceneId });
export const tryIt = (widget: TryItWidget): Block => ({
  type: "tryIt",
  widget,
});
/** Code with notes on 1-based lines. */
export const code = (
  language: CodeExample["language"],
  caption: string,
  lines: string[],
  notes: Record<number, string> = {},
): Block => ({
  type: "code",
  example: { language, caption, code: lines.join("\n") },
  notes: Object.entries(notes).map(([line, text]) => ({
    line: Number(line),
    text,
  })),
});
/** A quick check; the choices get ids a, b, c, d and `correct` is an index. */
export const quickCheck = (
  question: string,
  choices: string[],
  correct: number,
  explanation: string,
): Block => ({
  type: "check",
  question,
  choices: choices.map((text, i) => ({ id: "abcd"[i]!, text })),
  correctChoiceId: "abcd"[correct]!,
  explanation,
});
export const inTheNotesApp = (
  text: string,
  link: { fileId?: string; symbolId?: string; flowId?: string },
): Block => ({ type: "inTheNotesApp", text, ...link });

export const lesson = (
  id: string,
  title: string,
  minutes: number,
  ...blocks: Block[]
): Step => ({ kind: "lesson", id, title, minutes, blocks });

/** The level check: [exercise id, the step it tests] pairs. */
export const levelCheck = (
  id: string,
  title: string,
  questions: [exerciseId: string, stepId: string][],
): Step => ({
  kind: "check",
  id,
  title,
  minutes: 5,
  blocks: [],
  questions: questions.map(([exerciseId, stepId]): LevelCheckQuestion => ({
    exerciseId,
    stepId,
  })),
});

/** A reference table: [name, what it's for, example?] rows. */
export const reference = (
  caption: string,
  rows: [name: string, text: string, example?: string][],
): Block => ({
  type: "reference",
  caption,
  rows: rows.map(([name, text, example]) =>
    example === undefined ? { name, text } : { name, text, example },
  ),
});

/** Editable HTML (and CSS) with a live preview. */
export const playground = (caption: string, lines: string[]): Block => ({
  type: "playground",
  caption,
  code: lines.join("\n"),
});

/** Editable JavaScript, run with its console output shown. */
export const jsPlayground = (caption: string, lines: string[]): Block => ({
  type: "playground",
  caption,
  code: lines.join("\n"),
  language: "js",
});

// --- Modules: a core idea in depth, one part at a time --------------------

/** One part of a module: a heading over its blocks. */
export type Part = { id: string; title: string; blocks: Block[] };

export const part = (id: string, title: string, ...blocks: Block[]): Part => ({
  id,
  title,
  blocks,
});

/** A module lesson: objectives, then parts shown one at a time. */
export const moduleLesson = (
  id: string,
  title: string,
  minutes: number,
  objectives: string[],
  ...parts: Part[]
): Step => ({
  kind: "lesson",
  id,
  title,
  minutes,
  objectives,
  blocks: parts.flatMap((p) => p.blocks),
  sections: parts.map((p) => ({
    id: p.id,
    title: p.title,
    blockCount: p.blocks.length,
  })),
});

/** Code with labelled parts: [text in the code, label, note] in order. */
export const anatomy = (
  caption: string,
  lines: string[],
  parts: [text: string, label: string, note: string][],
): Block => ({
  type: "anatomy",
  caption,
  code: lines.join("\n"),
  parts: parts.map(([text, label, note]) => ({ text, label, note })),
});

/** Code run one move at a time, with variables, call stack and output. */
export const trace = (
  caption: string,
  lines: string[],
  steps: TraceStep[],
): Block => ({ type: "trace", caption, code: lines.join("\n"), steps });

/** The learner writes code; tests are [call, expected value as code]. */
export const yourTurn = (exercise: {
  title: string;
  task: string;
  starter: string[];
  tests: [call: string, expect: string][];
  hint: string;
  solution: string[];
}): Block => ({
  type: "yourTurn",
  title: exercise.title,
  task: exercise.task,
  starter: exercise.starter.join("\n"),
  tests: exercise.tests.map(([call, expect]) => ({ call, expect })),
  hint: exercise.hint,
  solution: exercise.solution.join("\n"),
});

/** A common mistake: the wrong code, what goes wrong, the fix and why. */
export const mistake = (m: {
  title: string;
  wrong: string[];
  problem: string;
  right: string[];
  why: string;
}): Block => ({
  type: "mistake",
  title: m.title,
  wrong: m.wrong.join("\n"),
  problem: m.problem,
  right: m.right.join("\n"),
  why: m.why,
});
